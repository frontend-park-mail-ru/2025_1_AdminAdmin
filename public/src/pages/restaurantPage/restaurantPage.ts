import { RestaurantHeader } from '@components/restaurantHeader/restaurantHeader';
import { RestaurantReviews } from '@components/restaurantReviews/restaurantReviews';
import { Categories } from '@components/categories/categories';
import { ProductCard } from '@components/productCard/productCard';
import Cart from '@components/cart/cart';
import { AppRestaurantRequests } from '@modules/ajax';

import template from './restaurantPage.hbs';
import type { RestaurantResponse } from '@myTypes/restaurantTypes';
import { router } from '@modules/routing';

/**
 * Класс, представляющий страницу конкретного ресторана.
 */
export default class RestaurantPage {
  private parent: HTMLElement;
  private readonly id: string;
  private props: RestaurantResponse;
  private cartComponent: Cart;
  private categoriesComponent: Categories;
  private productCards: ProductCard[] = [];
  private readonly categoriesWrapper: HTMLDivElement;
  private restaurantHeaderComponent: RestaurantHeader;
  private restaurantReviewsComponent: RestaurantReviews;

  /**
   * Создает экземпляр страницы ресторана.
   * @param parent - Родительский элемент, в который будет рендериться страница ресторана
   * @param id - Идентификатор ресторана, который нужно отобразить
   */
  constructor(parent: HTMLElement, id: string) {
    if (!parent) {
      throw new Error('RestaurantPage: no parent!');
    }
    this.parent = parent;
    this.id = id;
    this.categoriesWrapper = document.createElement('div');
    this.categoriesWrapper.classList.add('product-categories__wrapper');
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.restaurant-page__body');
    if (!element) {
      throw new Error(`Error: can't find restaurant-page`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Рендерит информацию о ресторане.
   * Запрашивает данные ресторана по ID и отображает их на странице.
   */
  async render(): Promise<void> {
    if (this.categoriesComponent) {
      this.categoriesComponent.remove();
      return;
    }

    try {
      this.props = await AppRestaurantRequests.Get(this.id);

      this.parent.innerHTML = template();

      const restaurantHeaderWrapper = this.self.querySelector(
        '.restaurant-header__wrapper',
      ) as HTMLElement;

      this.restaurantHeaderComponent = new RestaurantHeader(restaurantHeaderWrapper, this.props);

      this.restaurantHeaderComponent.render();

      const restaurantReviewsWrapper: HTMLElement = this.self.querySelector(
        '.restaurant-reviews__wrapper',
      );

      this.restaurantReviewsComponent = new RestaurantReviews(restaurantReviewsWrapper, {
        id: this.props.id,
        rating: this.props.rating,
        rating_count: this.props.rating_count,
        reviews: this.props.reviews,
        address: this.props.address,
        working_mode: this.props.working_mode,
      });
      this.restaurantReviewsComponent.render();

      const productCardsBody = this.self.querySelector('.product-cards__body') as HTMLElement;

      this.handleResize();

      this.categoriesComponent = new Categories(this.categoriesWrapper, productCardsBody);
      this.categoriesComponent.render();

      if (!this.props.categories) return;

      this.props.categories.forEach((category) => {
        this.categoriesComponent.addCategory(category.name);

        if (!category.products?.length) return;

        category.products.forEach((product) => {
          const productCardComponent = new ProductCard(
            productCardsBody,
            this.props.id,
            this.props.name,
            product,
          );
          productCardComponent.render();
          this.productCards.push(productCardComponent);
        });
      });

      this.categoriesComponent.hashChangeHandler();

      window.addEventListener('scroll', this.checkSticky);
      window.addEventListener('resize', this.handleResize);
    } catch (error) {
      console.error(error);
      router.goToPage('notFound');
    }
  }

  checkSticky = (): void => {
    const computedStyle = getComputedStyle(document.body);

    const cssVariableValue = parseInt(computedStyle.getPropertyValue('--real-header-height'), 10);

    const rect = this.categoriesWrapper.getBoundingClientRect();

    if (rect.top <= cssVariableValue) {
      this.categoriesWrapper.classList.add('is-sticky');
    } else {
      this.categoriesWrapper.classList.remove('is-sticky');
    }
  };

  handleResize = (): void => {
    this.relocateCategories();
    this.manageCart();
  };

  private relocateCategories = (): void => {
    const restaurantReviewsWrapper = this.self.querySelector(
      '.restaurant-reviews__wrapper',
    ) as HTMLElement;
    const mainDiv = this.self.querySelector('.restaurant-page__main') as HTMLElement;

    if (!restaurantReviewsWrapper || !mainDiv) {
      return;
    }

    if (window.innerWidth <= 800) {
      if (this.categoriesWrapper.parentElement !== restaurantReviewsWrapper.parentElement) {
        restaurantReviewsWrapper.insertAdjacentElement('afterend', this.categoriesWrapper);
      }
    } else {
      if (this.categoriesWrapper.parentElement !== mainDiv.parentElement) {
        mainDiv.insertAdjacentElement('beforebegin', this.categoriesWrapper);
        this.categoriesWrapper.classList.remove('is-sticky');
      }
    }
  };

  private manageCart = (): void => {
    const cartWrapper = this.self.querySelector('.cart__wrapper') as HTMLElement;

    if (window.innerWidth > 1200) {
      if (!this.cartComponent && cartWrapper) {
        this.cartComponent = new Cart(cartWrapper, this.props.id);
        this.cartComponent.render();
      }
    } else {
      this.cartComponent?.remove();
      this.cartComponent = undefined;
    }
  };

  /**
   * Удаляет страницу ресторана и очищает содержимое родительского элемента.
   */
  remove(): void {
    this.productCards.forEach((productCard) => productCard.remove());
    this.productCards = [];

    this.restaurantHeaderComponent?.remove();
    this.restaurantReviewsComponent?.remove();

    window.removeEventListener('scroll', this.checkSticky);
    window.removeEventListener('resize', this.handleResize);
    this.categoriesComponent?.remove();
    this.cartComponent?.remove();
    this.parent.innerHTML = '';
  }
}
