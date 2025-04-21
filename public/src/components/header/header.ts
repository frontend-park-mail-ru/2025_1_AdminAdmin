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
import { AppUserRequests } from '@modules/ajax';
import { Address } from '@components/address/address';

/**
 * Класс Header представляет основной заголовок страницы.
 * Он управляет навигацией и отображением кнопок входа/выхода в зависимости от состояния авторизации пользователя.
 */
export default class Header {
  private parent: HTMLElement;
  private logo!: Logo;
  private cartButton: Button;
  private loginButton!: Button;
  private profileButton: Button;
  private profileSettingsButton: Button;
  private logoutButton!: Button;
  private readonly handleScrollBound: () => void;
  private readonly clickHandler: (event: Event) => void;
  private addressComponents: Address[] = [];
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

  private async handleClick(event: Event): Promise<void> {
    const target = event.target as HTMLElement;

    if (this.isMapButtonClick(target)) {
      this.handleMapButtonClick();
      return;
    }

    if (this.isDropdownOpen()) {
      this.closeDropdown();
      return;
    }

    if (this.isSelectButtonClick(target)) {
      await this.handleSelectButtonClick();
      return;
    }

    this.toggleProfileDropdown(target);
  }

  private isMapButtonClick(target: HTMLElement): boolean {
    return !!target.closest('.header__location_dropdown_button');
  }

  private handleMapButtonClick(): void {
    const mapModal = new MapModal((newAddress: string) => userStore.setAddress(newAddress));
    modalController.openModal(mapModal);
  }

  private isDropdownOpen(): boolean {
    const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;
    return dropdown && dropdown.style.display === 'block';
  }

  private closeDropdown(): void {
    const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;
    dropdown.style.display = 'none';
    this.addressComponents.forEach((comp) => comp.remove());
    this.addressComponents = [];
  }

  private isSelectButtonClick(target: HTMLElement): boolean {
    return !!target.closest('.header__location_select_button');
  }

  private async handleSelectButtonClick(): Promise<void> {
    const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;

    if (!userStore.isAuth()) return;

    try {
      const addresses = await AppUserRequests.GetAddresses();
      const addressesContainer = this.self.querySelector(
        '.header__location_dropdown_options',
      ) as HTMLElement;

      this.addressComponents.forEach((comp) => comp.remove());
      this.addressComponents = [];

      if (Array.isArray(addresses)) {
        addresses.forEach((address) => {
          const addressComponent = new Address(addressesContainer, {
            ...address,
            isHeaderAddress: true,
          });
          addressComponent.render();
          this.addressComponents.push(addressComponent);
        });
      }

      dropdown.style.display = 'block';
    } catch (error) {
      toasts.error(error.error);
    }
  }

  private toggleProfileDropdown(target: HTMLElement): void {
    const profileDropdownOptions = document.querySelector(
      '.header__profile-dropdown__options',
    ) as HTMLElement;

    if (target.id === 'profile_button') {
      profileDropdownOptions.classList.toggle('active');
    } else if (
      profileDropdownOptions.classList.contains('active') &&
      !profileDropdownOptions.contains(target)
    ) {
      profileDropdownOptions.classList.remove('active');
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

    const authButtonContainer = document.querySelector('.header__auth_button') as HTMLElement;
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

    const profileButtonWrapper = document.querySelector(
      '.header__profile-dropdown__button__wrapper',
    ) as HTMLElement;
    this.profileButton = new Button(profileButtonWrapper, {
      id: 'profile_button',
      text: 'Профиль',
      onSubmit: undefined,
    });
    this.profileButton.render();

    const profileDropdownButtonsContainer = document.querySelector(
      '.header__profile-dropdown__buttons-container',
    ) as HTMLElement;
    this.profileSettingsButton = new Button(profileDropdownButtonsContainer, {
      id: 'profile_settings_button',
      text: 'Настройки',
      onSubmit: () => {
        document.querySelector('.header__profile-dropdown__options').classList.remove('active');
        router.goToPage('profilePage');
      },
    });
    this.profileSettingsButton.render();
    this.logoutButton = new Button(profileDropdownButtonsContainer, {
      id: 'logout_button',
      text: 'Выйти',
      onSubmit: () => {
        document.querySelector('.header__profile-dropdown__options').classList.remove('active');
        this.handleLogout();
      },
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
    if (userStore.isAuth()) {
      this.loginButton.hide();
      document.querySelector('.header__profile-dropdown').classList.add('active');
      document.querySelector('.header__profile-dropdown__first-name').textContent =
        userStore.getState().first_name;
      document.querySelector('.header__profile-dropdown__second-name').textContent =
        userStore.getState().last_name;
      this.profileButton.show();

      const avatarImage = document.getElementById(
        'header__profile-dropdown__image__avatar',
      ) as HTMLImageElement;
      avatarImage.src = `https://doordashers.ru/images_user/${userStore.getState().path}`;
    } else {
      document.querySelector('.header__profile-dropdown').classList.remove('active');
      this.loginButton.show();
      this.profileButton.hide();
      document.querySelector('.header__profile-dropdown__first-name').textContent = 'Имя';
      document.querySelector('.header__profile-dropdown__second-name').textContent = 'Фамилия';
    }

    const activeAddress = userStore.getActiveAddress();
    const locationButton: HTMLDivElement = this.parent.querySelector(
      '.header__location_select_button',
    );
    const locationText: HTMLSpanElement = locationButton.querySelector(
      '.header__location_select_button__text',
    );

    if (activeAddress) {
      locationButton.classList.add('selected');
      locationText.textContent = activeAddress;
      modalController.closeModal();
    } else {
      locationButton.classList.remove('selected');
      locationText.textContent = 'Укажите адрес доставки';
    }

    if (cartStore.getState().total_price) {
      this.cartButton.setText(cartStore.getState().total_price.toLocaleString('ru-RU') + ' ₽');
      this.cartButton.show();
    } else {
      this.cartButton.hide();
    }
  }

  /**
   * Обработчик выхода пользователя.
   * Осуществляет выход и отображает сообщение.
   */
  private async handleLogout(): Promise<void> {
    this.logoutButton.disable();
    try {
      await userStore.logout();
      toasts.success('Вы успешно вышли из системы');
      router.goToPage('home');
    } catch (error) {
      toasts.error(error.error);
    } finally {
      this.logoutButton.enable();
    }
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove(): void {
    this.logo?.remove();
    this.profileSettingsButton.remove();
    this.logoutButton?.remove();
    this.profileButton.remove();
    this.loginButton?.remove();
    this.cartButton.remove();
    this.parent.innerHTML = '';
    this.addressComponents.forEach((comp) => comp.remove());
    this.addressComponents = [];
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
