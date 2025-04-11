import { router } from '@modules/routing';
import { userStore } from '@store/userStore';
import { Logo } from '@components/logo/logo';
import { Button } from '@components/button/button';
import template from './header.hbs';
import { toasts } from '@modules/toasts';
import MapModal from '@pages/mapModal/mapModal';
import logoImg from '@assets/logo.png';
import { cartStore } from '@store/cartStore';
import { modalController } from '@modules/modalController';

/**
 * Класс Header представляет основной заголовок страницы.
 * Он управляет навигацией и отображением кнопок входа/выхода в зависимости от состояния авторизации пользователя.
 */
export default class Header {
  private parent: HTMLElement;
  private logo!: Logo;
  private cartButton: Button;
  private loginButton!: Button;
  private logoutButton!: Button;
  private readonly handleScrollBound: () => void;
  private readonly clickHandler: (event: Event) => void;
  private unsubscribeFromUserStore: (() => void) | null = null;
  private unsubscribeFromCartStore: (() => void) | null = null;

  /**
   * Создает экземпляр заголовка.
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.handleScrollBound = this.handleScroll.bind(this);
    this.unsubscribeFromUserStore = userStore.subscribe(() => this.updateHeaderState());
    this.unsubscribeFromCartStore = cartStore.subscribe(() => this.updateHeaderState());
    this.clickHandler = this.handleClick.bind(this);
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;

    if (dropdown) {
      dropdown.style.display = 'none';
    }

    if (target.closest('.header__location_select_button')) {
      dropdown.style.display = 'block';
    } else if (target.closest('.header__location_dropdown_button')) {
      const mapModal = new MapModal();
      modalController.openModal(mapModal);
    }
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement | null} - ссылка на объект
   */
  private get self(): HTMLElement | null {
    return document.querySelector('.header');
  }

  /**
   * Отображает заголовок на странице.
   */
  render(): void {
    this.parent.innerHTML = template();
    this.parent.classList.add('main_header');

    this.logo = new Logo(this.self.querySelector('.header__logo'), logoImg);
    this.logo.render();

    const authButtonContainer = document.querySelector('.header__auth_buttons') as HTMLElement;
    if (!authButtonContainer) return;

    const cartButtonContainer = document.querySelector('.header__cart_button') as HTMLElement;
    if (!cartButtonContainer) return;

    this.cartButton = new Button(cartButtonContainer, {
      id: 'cart_button',
      style: 'dark',
      text: '0',
      onSubmit: () => {
        const restaurantId = cartStore.getState().restaurant_id;
        if (restaurantId) router.goToPage('restaurantPage', restaurantId);
      },
    });

    this.cartButton.render();

    this.loginButton = new Button(authButtonContainer, {
      id: 'login_button',
      text: 'Вход',
      onSubmit: () => {
        router.goToPage('loginPage');
      },
    });
    this.loginButton.render();

    this.logoutButton = new Button(authButtonContainer, {
      id: 'logout_button',
      text: 'Выход',
      onSubmit: this.handleLogout.bind(this),
    });
    this.logoutButton.render();

    this.updateHeaderState();

    window.addEventListener('scroll', this.handleScrollBound);
    document.addEventListener('click', this.clickHandler);

    this.handleScroll();
  }

  /**
   * Обработчик события прокрутки страницы.
   * Добавляет или удаляет класс тени в зависимости от прокрутки.
   */
  private handleScroll(): void {
    const headerElement = this.self;
    if (!headerElement) return;

    if (window.scrollY > 0) {
      headerElement.classList.add('scrolled');
    } else {
      headerElement.classList.remove('scrolled');
    }
  }

  /**
   * Обновляет состояние аутентификации в заголовке.
   * Показывает или скрывает кнопки входа/выхода в зависимости от состояния пользователя.
   */
  private updateHeaderState(): void {
    const loginContainer = document.querySelector('.header__login') as HTMLElement;

    if (userStore.isAuth()) {
      this.loginButton.hide();
      this.logoutButton.show();

      if (loginContainer) {
        loginContainer.textContent = userStore.getState().login || '';
      }
    } else {
      this.loginButton.show();
      this.logoutButton.hide();

      if (loginContainer) {
        loginContainer.textContent = '';
      }
    }

    const activeAddress = userStore.getActiveAddress();
    if (activeAddress) {
      this.setButtonAddress(activeAddress);
      modalController.closeModal();
    }

    if (cartStore.getState().total_price) {
      this.cartButton.setText(cartStore.getState().total_price + ' ₽');
      this.cartButton.show();
    } else {
      this.cartButton.hide();
    }
  }

  private setButtonAddress(activeAddress: string) {
    const locationButton: HTMLDivElement = this.parent.querySelector(
      '.header__location_select_button',
    );
    locationButton.classList.add('selected');

    locationButton.innerText = activeAddress;
  }

  /**
   * Обработчик выхода пользователя.
   * Осуществляет выход и отображает сообщение.
   */
  private async handleLogout(): Promise<void> {
    try {
      await userStore.logout();
      toasts.success('Вы успешно вышли из системы');
    } catch (error) {
      toasts.error(error.message);
    }
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove(): void {
    this.logo?.remove();
    this.loginButton?.remove();
    this.logoutButton?.remove();
    this.cartButton.remove();
    this.parent.innerHTML = '';
    this.parent.classList.remove('main_header');
    window.removeEventListener('scroll', this.handleScrollBound);
    document.removeEventListener('click', this.clickHandler);
    if (this.unsubscribeFromUserStore) {
      this.unsubscribeFromUserStore();
      this.unsubscribeFromUserStore = null;
    }
    if (this.unsubscribeFromCartStore) {
      this.unsubscribeFromCartStore();
      this.unsubscribeFromCartStore = null;
    }
  }
}
