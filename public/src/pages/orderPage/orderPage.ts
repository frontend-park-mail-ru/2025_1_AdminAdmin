import template from './orderPage.hbs';
import { FormInput } from '@components/formInput/formInput';
import inputsConfig from './orderPageConfig';
import { cartStore } from '@store/cartStore';
import { CartCard } from '@components/productCard/cartCard/cartCard';
import { userStore } from '@store/userStore';
import { CartProduct } from '@myTypes/cartTypes';
import { toasts } from '@modules/toasts';
import { Button } from '@components/button/button';
import { AppOrderRequests } from '@modules/ajax';
import { CreateOrderPayload, I_OrderResponse, statusMap } from '@myTypes/orderTypes';
import MapModal from '@pages/mapModal/mapModal';
import { modalController } from '@modules/modalController';
import YouMoneyForm from '@components/youMoneyForm/youMoneyForm';
import { router } from '@modules/routing';
import { StepProgressBar } from '@//components/stepProgressBar/stepProgressBar';
import { formatDate, formatNumber } from '@modules/utils';
import { ProductsCarousel } from '@components/productsCarousel/productsCarousel';
import { Checkbox } from '@components/checkbox/checkbox';
import { PromocodeForm } from '@components/promocodeForm/promocodeFrom';

export default class OrderPage {
  private parent: HTMLElement;
  private readonly orderId: string;
  private inputs: Record<string, FormInput> = {};
  private cartCards = new Map<string, CartCard>();
  private submitButton: Button;
  private checkbox: Checkbox;
  private unsubscribeFromStore: (() => void) | null = null;
  private youMoneyForm: YouMoneyForm = null;
  private isRemoved = false;
  private stepProgressBar: StepProgressBar = null;
  private discountedPrice: number = null;
  private recommendedProductsCarousel: ProductsCarousel;
  private promocodeForm: PromocodeForm;

  constructor(parent: HTMLElement, orderId?: string) {
    if (!parent) {
      throw new Error('OrderPage: no parent!');
    }
    this.parent = parent;
    this.orderId = orderId;
  }

  get self(): HTMLElement | null {
    const element = this.parent.querySelector('.order-page');
    return element as HTMLElement | null;
  }

  private async fetchOrderData(orderId: string) {
    try {
      const order = await AppOrderRequests.getOrderById(orderId);
      return {
        order,
        orderId: order.id.slice(-4),
        created_at: order.created_at,
        totalPrice: order.final_price,
        status: order.status,
        leave_at_door: order.leave_at_door,
        restaurantName: order.order_products.restaurant_name,
        address: order.address,
        products: order.order_products.products,
      };
    } catch (error) {
      console.error(error);
      router.goToPage('home');
      return null;
    }
  }

  /**
   * Функция рендера прогресс бара на странице
   */
  private renderProgressBar(step: number) {
    const orderProgressSteps = [
      {
        id: 'order-progress_cart',
        image: { src: '/src/assets/cart.png' },
        text: statusMap.new.text,
      },
      {
        id: 'order-progress_paid',
        image: { src: '/src/assets/credit_card.png' },
        text: statusMap.paid.text,
      },
      {
        id: 'order-progress_travel',
        image: { src: '/src/assets/delivery.png' },
        text: statusMap.in_delivery.text,
      },
      {
        id: 'order-progress_finish',
        image: { src: '/src/assets/complete_order.png' },
        text: statusMap.delivered.text,
      },
    ];
    const stepProgressBarContainer = this.self.querySelector(
      '.step-progress-bar-container',
    ) as HTMLElement;
    this.stepProgressBar = new StepProgressBar(stepProgressBarContainer, {
      steps: orderProgressSteps,
      lastCompleted: step,
    });

    this.stepProgressBar.render();
  }

  private renderInputs(order?: I_OrderResponse) {
    const inputsContainer = document.getElementById('form__line_order-page_address');
    if (!inputsContainer) {
      console.error('OrderPage: контейнер не найден');
      return;
    }

    for (const [key, config] of Object.entries(inputsConfig.addressInputs)) {
      const inputComponent = new FormInput(inputsContainer, config);
      inputComponent.render();
      if (order) {
        inputComponent.setValue(order[key as keyof I_OrderResponse] as string);
        inputComponent.disable();
      }
      this.inputs[key] = inputComponent;
    }
  }

  private renderCourierComment(order?: I_OrderResponse) {
    const orderPageComment: HTMLDivElement = this.self.querySelector('.order-page__comment');
    if (orderPageComment) {
      const inputComponent = new FormInput(orderPageComment, inputsConfig.courier_comment);
      inputComponent.render();
      if (order) {
        inputComponent.setValue(order.courier_comment);
        inputComponent.disable();
      }
      this.inputs['orderPageComment'] = inputComponent;
    }
  }

  private renderPromocodeForm() {
    if (!userStore.isAuth()) return;

    const promocodeFormContainer: HTMLDivElement = this.self.querySelector('.order-page__summary');

    this.promocodeForm = new PromocodeForm(
      promocodeFormContainer,
      (discount: number) => {
        const additionalContentBlock: HTMLDivElement = this.parent.querySelector(
          '.order-page__summary__additional_content',
        );
        additionalContentBlock.style.display = 'flex';

        const discountBlock: HTMLDivElement = additionalContentBlock.querySelector(
          '.order-page__summary__discount',
        );
        const oldTotalBlock: HTMLDivElement = additionalContentBlock.querySelector(
          '.order-page__summary__price',
        );

        const oldTotal = cartStore.getState().total_sum;
        const newTotal = oldTotal * (1 - discount);
        const difference = newTotal - oldTotal;
        const discountInPercent = discount * 100;

        const cartTotal: HTMLDivElement = this.parent.querySelector('.cart__total');

        discountBlock.innerText = `${formatNumber(difference).replace('.', ',')} ₽ (${formatNumber(discountInPercent)}%)`;
        oldTotalBlock.innerText = `${formatNumber(oldTotal)} ₽`;
        cartTotal.textContent = formatNumber(newTotal).replace('.', ',');

        this.discountedPrice = newTotal;
      },

      () => {
        const additionalContentBlock: HTMLDivElement = this.parent.querySelector(
          '.order-page__summary__additional_content',
        );
        additionalContentBlock.style.display = 'none';

        const oldTotal = cartStore.getState().total_sum;

        const cartTotal: HTMLDivElement = this.parent.querySelector('.cart__total');
        cartTotal.textContent = oldTotal.toLocaleString('ru-RU');

        this.discountedPrice = null;
      },
    );

    this.promocodeForm.render();
  }

  private renderSubmitButton() {
    const submitButtonContainer: HTMLDivElement = this.self.querySelector('.order-page__summary');
    if (!submitButtonContainer) return;

    if (userStore.isAuth()) {
      this.submitButton = new Button(submitButtonContainer, {
        id: 'order-page__submit__button',
        text: 'Оформить заказ',
        style: 'button_active',
        onSubmit: async () => {
          if (cartStore.getState().total_sum > 100000) {
            toasts.error('Сумма заказа не должна превышать 100 000 ₽. Разделите его на несколько');
            return;
          }
          try {
            this.submitButton.disable();
            await this.sendOrder();
          } catch (error) {
            console.error(error);
            toasts.error(error.message);
          } finally {
            this.submitButton.enable();
          }
        },
      });
    } else {
      toasts.error('Для формирования заказа нужно авторизоваться');
      this.submitButton = new Button(submitButtonContainer, {
        id: 'order-page__submit__button',
        text: 'Авторизоваться',
        style: 'button_active',
        onSubmit: () => router.goToPage('loginPage'),
      });
    }
    this.submitButton.render();
  }

  async render(): Promise<void> {
    let data;
    if (this.orderId) {
      data = await this.fetchOrderData(this.orderId);
      if (!data) {
        router.goToPage('home');
        return;
      }
    } else {
      data = {
        order: undefined,
        orderId: undefined,
        status: 'creation',
        totalPrice: cartStore.getState().total_sum,
        leave_at_door: false,
        restaurantName: cartStore.getState().restaurant_name,
        address: userStore.getActiveAddress(),
        products: cartStore.getState().products,
      };
    }

    const templateProps = {
      isPreformed: data.order !== undefined,
      orderId: data.orderId,
      orderDate: formatDate(data?.created_at),
      totalPrice: data.totalPrice,
      restaurantName: data.restaurantName,
      address: data.address,
    };

    this.parent.innerHTML = template(templateProps);

    this.renderProgressBar(statusMap[data.status].step_no);
    this.renderInputs(data.order);
    this.renderCourierComment(data.order);

    if (!data.products.length) {
      router.goToPage('home');
      return;
    }

    this.createProductCards(data.products, Boolean(data.order));

    const deliveryContainer: HTMLDivElement = this.parent.querySelector('.order-page__delivery');
    this.checkbox = new Checkbox(deliveryContainer, {
      id: 'orderPageCheckbox',
      label: 'Оставить у двери',
      checked: data.leave_at_door,
    });

    this.checkbox.render();

    if (data.status !== 'creation') {
      this.checkbox.disable();

      if (data.status === 'new') {
        this.createYouMoneyForm(data.order);
      }
      return;
    }

    this.createRecommendedProducts();
    const bin = this.self.querySelector('.order-page__products__header__clear');
    bin?.addEventListener('click', this.handleClear);
    this.renderPromocodeForm();
    this.renderSubmitButton();
    this.unsubscribeFromStore = cartStore.subscribe(() => this.updateCards());
  }

  private createRecommendedProducts() {
    const recommendedProductsWrapper: HTMLDivElement = this.parent.querySelector(
      '.order-page__recommended_products',
    );
    const recommendedProducts = cartStore.getState().recommended_products;
    if (!recommendedProducts) {
      recommendedProductsWrapper.style.display = 'none';
      return;
    }
    this.recommendedProductsCarousel = new ProductsCarousel(
      recommendedProductsWrapper,
      recommendedProducts,
    );
    this.recommendedProductsCarousel.render();
  }

  private createProductCards(products: CartProduct[], shouldDisable: boolean): void {
    const container = this.self.querySelector('.order-page__products') as HTMLDivElement;
    if (!container) return;

    for (const product of products) {
      const card = new CartCard(container, product);
      card.render();
      if (shouldDisable) card.disable();
      this.cartCards.set(product.id, card);
    }
  }

  private updateTotalPrice() {
    const totalPrice: number = cartStore.getState().total_sum;

    const cartTotal: HTMLDivElement = this.self.querySelector('.cart__total');
    cartTotal.textContent = totalPrice.toLocaleString('ru-RU');
  }

  setError(errorMessage: string) {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = errorMessage;
    }
  }

  clearError() {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  async sendOrder() {
    const formValues: Record<string, string> = {};

    this.clearError();

    for (const [key, input] of Object.entries(this.inputs)) {
      formValues[key] = input.value;
      const validationResult = input.checkValue();
      if (typeof input.checkValue() === 'string') {
        this.setError(validationResult.toString());
        return;
      }
    }

    const final_price = this.discountedPrice
      ? this.discountedPrice
      : cartStore.getState().total_sum;
    const address = userStore.getActiveAddress();

    if (!address) {
      const mapModal = new MapModal(async (newAddress: string) => {
        userStore.setAddress(newAddress);
        modalController.closeModal();
        await this.sendOrder();
      });

      modalController.openModal(mapModal);
      return;
    }

    const payload: CreateOrderPayload = {
      status: 'new',
      address,
      apartment_or_office: formValues.apartment_or_office,
      intercom: formValues.intercom,
      entrance: formValues.entrance,
      floor: formValues.floor,
      courier_comment: formValues.courier_comment,
      leave_at_door: this.checkbox.isChecked,
      final_price,
      promocode: userStore.getActivePromocode(),
    };

    try {
      const newOrder = await AppOrderRequests.CreateOrder(payload);
      toasts.success('Заказ успешно оформлен!');

      this.handleCreation(newOrder);
    } catch (err) {
      toasts.error(err.message || 'Не удалось оформить заказ');
    }
  }

  private handleCreation(newOrder: I_OrderResponse) {
    window.history.replaceState({}, '', `/order/${newOrder.id}`);
    const pageHeader: HTMLElement = this.parent.querySelector('.order-page__header');

    pageHeader.textContent = `Заказ ${newOrder.id.slice(-4)} от ${formatDate(newOrder.created_at)}`;
    pageHeader.classList.add('formed');

    const additionalContentBlock: HTMLDivElement = this.parent.querySelector(
      '.order-page__summary__additional_content',
    );
    additionalContentBlock.style.display = 'none';

    this.promocodeForm.remove();

    const cartTotal: HTMLDivElement = this.self.querySelector('.cart__total');
    cartTotal.textContent = newOrder.final_price.toLocaleString('ru-RU');

    this.checkbox.disable();

    for (const input of Object.values(this.inputs)) {
      input.disable();
    }

    for (const cartCard of this.cartCards.values()) {
      cartCard.disable();
    }

    const checkBox: HTMLInputElement = this.parent.querySelector('#orderPageCheckbox');
    checkBox.disabled = true;
    checkBox.style.pointerEvents = 'none';

    const clearCart: HTMLDivElement = this.parent.querySelector(
      '.order-page__products__header__clear',
    );
    clearCart.style.display = 'none';
    this.submitButton.hide();

    const recommendedProductsContainer: HTMLDivElement = this.parent.querySelector(
      '.order-page__recommended_products',
    );
    recommendedProductsContainer.style.display = 'none';

    this.recommendedProductsCarousel?.remove();
    this.createYouMoneyForm(newOrder);
    this.stepProgressBar.next();
  }

  private createYouMoneyForm(newOrder: I_OrderResponse): void {
    const container: HTMLDivElement = this.self.querySelector('.order-page__summary');
    this.youMoneyForm = new YouMoneyForm(container, newOrder.final_price, newOrder.id);
    this.youMoneyForm.render();
  }

  private handleClear = async (): Promise<void> => {
    const bin: HTMLElement = this.self.querySelector('.order-page__products__header__clear');
    bin.style.pointerEvents = 'none';

    try {
      await cartStore.clearCart();
    } catch (error) {
      toasts.error(error.message);
    } finally {
      bin.style.pointerEvents = '';
    }
  };

  private updateCards(): void {
    if (this.isRemoved) return;
    const container: HTMLDivElement = this.self.querySelector('.order-page__products');
    if (!container) return;

    const products: CartProduct[] = cartStore.getState().products;

    this.updateTotalPrice();

    const currentIds = new Set(products.map((p) => p.id));

    for (const [id, card] of this.cartCards.entries()) {
      if (!currentIds.has(id)) {
        card.remove();
        this.cartCards.delete(id);
      }
    }

    for (const product of products) {
      if (!this.cartCards.has(product.id)) {
        const card = new CartCard(container, product);
        card.render();
        this.cartCards.set(product.id, card);
      }
    }

    if (!products.length) {
      router.goToPage('home');
    }
  }

  /**
   * Устанавливает статус от сервера (оплачено, в пути, завершен или другой, но с сервера)
   */
  /*
  private handleStepFromServer(status: number): void {
    if (status >= 0 && status <= 4) {
      this.stepProgressBar.goto(status);
    } else {
      throw new Error('OrderPage: invalid status! Must be 0...4')
    }
  }
  */

  remove(): void {
    if (!this.self) return;
    this.isRemoved = true;

    this.removeCards();
    this.removeListeners();
    this.removeComponents();
    this.clearInputs();

    if (this.unsubscribeFromStore) this.unsubscribeFromStore();
    this.parent.innerHTML = '';
  }

  private removeCards(): void {
    this.cartCards.forEach((card) => card.remove());
    this.cartCards.clear();
  }

  private removeListeners(): void {
    const bin = this.self?.querySelector('.order-page__products__header__clear');
    if (bin) {
      bin.removeEventListener('click', this.handleClear);
    }
  }

  private removeComponents(): void {
    this.stepProgressBar?.remove();
    this.recommendedProductsCarousel?.remove();
    this.submitButton?.remove();
    this.promocodeForm?.remove();

    if (this.youMoneyForm) {
      cartStore.clearLocalCart();
      this.youMoneyForm.remove();
    }

    this.checkbox?.remove();
  }

  private clearInputs(): void {
    Object.values(this.inputs).forEach((input) => input.remove());
    this.inputs = {};
  }
}
