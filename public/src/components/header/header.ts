import { router } from '@modules/routing';
import { userStore } from '@store/userStore';
import { Logo } from '@components/logo/logo';
import { Button } from '@components/button/button';
import template from './header.hbs';
import { toasts } from '@modules/toasts';
import MapModal from '@pages/mapModal/mapModal';
import logoImg from '@assets/logo.png';
import smallLogo from '@assets/small_logo.png';
import { cartStore } from '@store/cartStore';
import { modalController } from '@modules/modalController';
import { AppUserRequests } from '@modules/ajax';
import { Address } from '@components/address/address';

/**
 * Класс Header представляет основной заголовок страницы.
 * Он управляет навигацией и отображением кнопок входа/выхода в зависимости от состояния авторизации пользователя.
 */
export default class Header {
  private readonly parent: HTMLElement;
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
  private readonly handleResizeBound: () => void;
  private lastScreenSizeCategory: 'mobile' | 'desktop' | 'large-desktop' | null = null;

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
    this.handleResizeBound = this.handleResize.bind(this);
  }

  private handleResize(): void {
    const width = window.innerWidth;
    let currentCategory: 'mobile' | 'desktop' | 'large-desktop';

    if (width <= 600) {
      currentCategory = 'mobile';
    } else if (width <= 1200) {
      currentCategory = 'desktop';
    } else {
      currentCategory = 'large-desktop';
    }

    if (this.lastScreenSizeCategory === currentCategory) {
      return;
    }

    this.lastScreenSizeCategory = currentCategory;

    const headerElement = this.parent;
    const cartButtonContainer: HTMLElement = document.querySelector('.header__cart_button');
    const overlay = document.querySelector('.header__overlay') as HTMLElement;

    if (currentCategory === 'mobile') {
      cartButtonContainer.style.boxShadow = '0 -8px 10px rgba(0, 0, 0, 0.2)';
      headerElement.classList.add('mobile_header');
      headerElement.classList.remove('main_header');
      overlay.style.display = 'none';
    } else {
      cartButtonContainer.style.setProperty('box-shadow', 'none');
      headerElement.classList.add('main_header');
      headerElement.classList.remove('mobile_header');
      overlay.style.display = 'none';
    }

    const logoElement: HTMLElement = this.self?.querySelector('.header__logo');
    if (!logoElement) return;

    this.logo?.remove();

    if (currentCategory === 'large-desktop') {
      this.logo = new Logo(logoElement, logoImg);
      this.cartButton.setOnSubmit(() => {
        const restaurantId = cartStore.getState().restaurant_id;
        if (restaurantId) router.goToPage('restaurantPage', restaurantId);
      });
    } else {
      this.logo = new Logo(logoElement, smallLogo);
      this.cartButton.setOnSubmit(() => router.goToPage('orderPage'));
    }

    this.logo.render();
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
    const overlay = document.querySelector('.header__overlay') as HTMLElement;
    this.addressComponents.forEach((comp) => comp.remove());
    this.addressComponents = [];

    if (this.parent.classList.contains('mobile_header')) {
      dropdown.style.animation = 'moveDown 0.2s linear forwards';
      const cartButtonContainer: HTMLElement = document.querySelector('.header__cart_button');
      cartButtonContainer.style.boxShadow = '0 -8px 10px rgba(0, 0, 0, 0.2)';
      setTimeout(() => {
        dropdown.style.display = 'none';
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 300);
      }, 200);
    } else {
      dropdown.style.display = 'none';
    }
  }

  private isSelectButtonClick(target: HTMLElement): boolean {
    return !!target.closest('.header__location_select_button');
  }

  private async handleSelectButtonClick(): Promise<void> {
    const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;

    dropdown.style.display = 'block';

    if (this.parent.classList.contains('mobile_header')) {
      const overlay = document.querySelector('.header__overlay') as HTMLElement;
      overlay.style.display = 'block';
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 0);
      dropdown.style.animation = 'moveUp 0.2s linear forwards';
      const cartButtonContainer: HTMLElement = document.querySelector('.header__cart_button');
      cartButtonContainer.style.setProperty('box-shadow', 'none');
    }

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
    } catch (error) {
      toasts.error(error.message);
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

    const authButtonContainer = document.querySelector('.header__auth_button') as HTMLElement;
    if (!authButtonContainer) return;

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

    const cartButtonContainer: HTMLElement = document.querySelector('.header__cart_button');
    if (!cartButtonContainer) return;

    this.cartButton = new Button(cartButtonContainer, {
      id: 'cart_button',
      style: 'dark',
      text: '0',
    });
    this.cartButton.render();

    this.logoutButton = new Button(profileDropdownButtonsContainer, {
      id: 'logout_button',
      text: 'Выйти',
      onSubmit: async () => {
        document.querySelector('.header__profile-dropdown__options').classList.remove('active');
        await this.handleLogout();
      },
    });
    this.logoutButton.render();

    this.handleResize();

    this.updateHeaderState();

    window.addEventListener('resize', this.handleResizeBound);
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

    const cartButtonContainer: HTMLElement = document.querySelector('.header__cart_button');

    if (cartStore.getState().total_price) {
      this.cartButton.setText(cartStore.getState().total_price.toLocaleString('ru-RU') + ' ₽');
      cartButtonContainer.style.display = 'block';
    } else {
      cartButtonContainer.style.display = 'none';
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
    } catch (error) {
      toasts.error(error.message);
    } finally {
      this.logoutButton.enable();
    }
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove(): void {
    if (this.logo) this.logo.remove();
    this.profileSettingsButton.remove();
    this.logoutButton?.remove();
    this.profileButton.remove();
    this.loginButton?.remove();
    if (this.cartButton) this.cartButton.remove();
    this.parent.innerHTML = '';
    this.addressComponents.forEach((comp) => comp.remove());
    this.addressComponents = [];
    this.parent.classList.remove('main_header');
    this.parent.classList.remove('mobile_header');
    window.removeEventListener('resize', this.handleResizeBound);
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
