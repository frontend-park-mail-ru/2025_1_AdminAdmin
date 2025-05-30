import { router } from '@modules/routing';
import { userStore } from '@store/userStore';
import { Logo } from '@components/logo/logo';
import { Button } from 'doordashers-ui-kit';
import template from './header.hbs';
import { toasts } from 'doordashers-ui-kit';
import MapModal from '@pages/mapModal/mapModal';
import logoImg from '@assets/logo.svg';
import cartImg from '@assets/cart.svg';
import settingsImg from '@assets/settings.svg';
import myLocationImg from '@assets/mylocation.svg';
import ordersImg from '@assets/orders.svg';
import promocodeImg from '@assets/promocode.svg';
import logoutImg from '@assets/logout.svg';
import smallLogo from '@assets/small_logo.png';
import { cartStore } from '@store/cartStore';
import { modalController } from '@modules/modalController';
import { AppUserRequests } from '@modules/ajax';
import { Address } from '@components/address/address';
import { FormInput } from 'doordashers-ui-kit';

/**
 * Класс Header представляет основной заголовок страницы.
 * Он управляет навигацией и отображением кнопок входа/выхода в зависимости от состояния авторизации пользователя.
 */
export default class Header {
  private readonly parent: HTMLElement;
  private logo!: Logo;
  private cartButton: Button;
  private loginButton!: Button;
  private profileButton: HTMLDivElement;
  private profilesButtons: Button[] = [];
  private readonly handleScrollBound: () => void;
  private readonly clickHandler: (event: Event) => void;
  private addressComponents: Address[] = [];
  private unsubscribeFromUserStore: (() => void) | null = null;
  private unsubscribeFromCartStore: (() => void) | null = null;
  private addresses: { address: string; id: string; user_id: string }[] = [];
  private readonly handleResizeBound: () => void;
  private lastScreenSizeCategory: 'mobile' | 'desktop' | 'large-desktop' | null = null;
  private searchInput: FormInput;
  private searchButton: Button;
  private searchAll: boolean;
  private logoutButton: Button;
  private isAuth = false;

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
      const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;
      dropdown.style.setProperty('animation', '');

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
        const cartRestaurantId = cartStore.getState().restaurant_id;
        const urlRestaurantId = router.getCurrentPageId();

        if (!cartRestaurantId) {
          return;
        } else if (cartRestaurantId !== urlRestaurantId) {
          router.goToPage('restaurantPage', cartRestaurantId);
        } else {
          router.goToPage('orderPage');
        }
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

    if (this.isLocationDropdownOpen()) {
      this.closeDropdown();
    }

    if (this.isProfileDropdownOpen()) {
      this.toggleProfileDropdown();
      if (!this.isSelectButtonClick(target) || window.innerWidth <= 600) {
        return;
      }
    }

    if (this.isSelectButtonClick(target)) {
      await this.handleSelectButtonClick();
      return;
    }
  }

  private isMapButtonClick(target: HTMLElement): boolean {
    return !!target.closest('.header__location_dropdown_button');
  }

  private handleMapButtonClick(): void {
    const mapModal = new MapModal((newAddress: string) => userStore.setAddress(newAddress));
    modalController.openModal(mapModal);
  }

  private isLocationDropdownOpen(): boolean {
    const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;

    if (window.innerWidth <= 600) {
      return dropdown && dropdown.style.display === 'block';
    }

    return dropdown && dropdown.classList.contains('enter');
  }

  private isProfileDropdownOpen(): boolean {
    const profileDropdownOptions = document.querySelector(
      '.header__profile-dropdown__options',
    ) as HTMLElement;

    if (window.innerWidth <= 600) {
      return profileDropdownOptions && profileDropdownOptions.classList.contains('enter');
    }

    return profileDropdownOptions && profileDropdownOptions.classList.contains('enter');
  }

  private closeDropdown = (skipProfile = false) => {
    const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;
    const overlay = document.querySelector('.header__overlay') as HTMLElement;

    if (!skipProfile) {
      const profileDropdownOptions = document.querySelector(
        '.header__profile-dropdown__options',
      ) as HTMLElement;
      if (profileDropdownOptions.classList.contains('enter')) this.toggleProfileDropdown();
    }

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
      dropdown.classList.add('leave');
      dropdown.classList.remove('enter');

      setTimeout(() => {
        dropdown.classList.remove('leave');
      }, 300);
    }
  };

  private isSelectButtonClick(target: HTMLElement): boolean {
    return !!target.closest('.header__location_select_button');
  }

  private async handleSelectButtonClick(): Promise<void> {
    const dropdown = document.querySelector('.header__location_dropdown') as HTMLElement;

    if (this.parent.classList.contains('mobile_header')) {
      dropdown.style.display = 'block';
      const overlay = document.querySelector('.header__overlay') as HTMLElement;
      overlay.style.display = 'block';
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 0);
      dropdown.style.animation = 'moveUp 0.2s linear forwards';
      const cartButtonContainer: HTMLElement = document.querySelector('.header__cart_button');
      cartButtonContainer.style.setProperty('box-shadow', 'none');
    } else {
      dropdown.classList.add('enter');
    }

    if (!userStore.isAuth()) return;

    if (this.addresses.length) return;

    try {
      this.addresses = await AppUserRequests.GetAddresses();
      const addressesContainer = this.self.querySelector(
        '.header__location_dropdown_options',
      ) as HTMLElement;

      this.addressComponents.forEach((comp) => comp.remove());
      this.addressComponents = [];

      if (Array.isArray(this.addresses)) {
        this.addresses.forEach((address) => {
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

  private toggleProfileDropdown = (event?: MouseEvent) => {
    this.closeDropdown(true);

    event?.stopPropagation();
    const profileDropdownOptions = document.querySelector(
      '.header__profile-dropdown__options',
    ) as HTMLElement;

    if (!profileDropdownOptions.classList.contains('enter')) {
      profileDropdownOptions.classList.add('enter');
      profileDropdownOptions.classList.remove('leave');
      profileDropdownOptions.style.display = 'flex';
    } else {
      profileDropdownOptions.classList.add('leave');
      profileDropdownOptions.classList.remove('enter');

      setTimeout(() => {
        profileDropdownOptions.classList.remove('leave');
        profileDropdownOptions.style.display = 'none';
      }, 300);
    }
  };

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

    const headerSearchContainer: HTMLDivElement = this.parent.querySelector('.header__search');
    this.searchInput = new FormInput(headerSearchContainer, {
      id: 'header__search__input',
      placeholder: 'Найти ресторан или блюдо',
      type: 'search',
      hideErrors: true,
    });
    this.searchInput.render();

    this.searchButton = new Button(headerSearchContainer, {
      id: 'header__search__button',
      text: 'Найти',
      style: 'search_button dark',
      type: 'submit',
    });
    this.searchButton.render();

    this.loginButton = new Button(authButtonContainer, {
      id: 'login_button',
      text: 'Вход',
      onSubmit: () => {
        router.goToPage('loginPage');
      },
    });
    this.loginButton.render();

    this.profileButton = document.querySelector('.header__profile-dropdown__button');

    this.profileButton.addEventListener('click', this.toggleProfileDropdown);

    const profileDropdownButtonsContainer = document.querySelector(
      '.header__profile-dropdown__buttons-container',
    ) as HTMLElement;

    const profileSettingsButton = new Button(profileDropdownButtonsContainer, {
      id: 'profile_settings_button',
      iconSrc: settingsImg,
      iconAlt: 'Настройки',
      text: 'Настройки',
      onSubmit: () => {
        document.querySelector('.header__profile-dropdown__options').classList.remove('enter');
        router.goToPage('profilePage');
      },
    });
    profileSettingsButton.render();

    this.profilesButtons.push(profileSettingsButton);

    const locationsButton = new Button(profileDropdownButtonsContainer, {
      id: 'profile_locations_button',
      iconSrc: myLocationImg,
      iconAlt: 'Адреса',
      text: 'Мои адреса',
      onSubmit: () => {
        document.querySelector('.header__profile-dropdown__options').classList.remove('enter');
        router.goToPage('profilePage', null, 'addresses');
      },
    });

    locationsButton.render();
    this.profilesButtons.push(locationsButton);

    const promocodesButton = new Button(profileDropdownButtonsContainer, {
      id: 'profile_promocodes_button',
      iconSrc: promocodeImg,
      iconAlt: 'Промокоды',
      text: 'Мои промокоды',
      onSubmit: () => {
        document.querySelector('.header__profile-dropdown__options').classList.remove('active');
        router.goToPage('profilePage', null, 'promocodes');
      },
    });

    promocodesButton.render();
    this.profilesButtons.push(promocodesButton);

    const ordersButton = new Button(profileDropdownButtonsContainer, {
      id: 'profile_orders_button',
      iconSrc: ordersImg,
      iconAlt: 'Заказы',
      text: 'Мои заказы',
      onSubmit: () => {
        document.querySelector('.header__profile-dropdown__options').classList.remove('active');
        router.goToPage('profilePage', null, 'orders');
      },
    });

    ordersButton.render();
    this.profilesButtons.push(ordersButton);

    this.logoutButton = new Button(profileDropdownButtonsContainer, {
      id: 'logout_button',
      iconSrc: logoutImg,
      iconAlt: 'Выйти',
      text: 'Выйти',
      onSubmit: async () => {
        document.querySelector('.header__profile-dropdown__options').classList.remove('active');
        await this.handleLogout();
      },
    });
    this.logoutButton.render();

    const cartButtonContainer: HTMLElement = document.querySelector('.header__cart_button');
    if (!cartButtonContainer) return;
    this.cartButton = new Button(cartButtonContainer, {
      id: 'cart_button',
      style: 'dark',
      iconSrc: cartImg,
      iconAlt: 'cartIcon',
      text: '0',
    });
    this.cartButton.render();

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
    const active_address = userStore.getActiveAddress();
    const locationButton: HTMLDivElement = this.parent.querySelector(
      '.header__location_select_button',
    );
    const locationText: HTMLSpanElement = locationButton.querySelector(
      '.header__location_select_button__text',
    );

    if (active_address) {
      locationButton.classList.add('selected');
      locationText.textContent = active_address;
      modalController.closeModal();
    } else {
      locationButton.classList.remove('selected');
      locationText.textContent = 'Укажите адрес доставки';
    }

    const cartButtonContainer: HTMLElement = document.querySelector('.header__cart_button');

    if (cartStore.getState().total_sum) {
      this.cartButton.setText(cartStore.getState().total_sum.toLocaleString('ru-RU') + ' ₽');
      cartButtonContainer.style.display = 'block';
    } else {
      cartButtonContainer.style.display = 'none';
    }

    if (this.isAuth === userStore.isAuth()) {
      return;
    }

    if (userStore.isAuth()) {
      this.loginButton.hide();
      document.querySelector('.header__profile-dropdown__options__login').textContent =
        userStore.getState().login;
      document.querySelector('.header__profile-dropdown__options__name').textContent =
        userStore.getState().first_name + ' ' + userStore.getState().last_name;

      this.profileButton.style.display = 'flex';

      const avatarImage = document.getElementById(
        'header__profile-dropdown__image__avatar',
      ) as HTMLImageElement;
      avatarImage.onerror = () => {
        avatarImage.src = './src/assets/profile.png';
      };
      avatarImage.src = `https://doordashers.ru/images_user/${userStore.getState().path}`;
    } else {
      const profileDropdownOptions = document.querySelector(
        '.header__profile-dropdown__options',
      ) as HTMLElement;

      profileDropdownOptions.classList.remove('enter');
      profileDropdownOptions.style.display = 'none';

      const el = document.querySelector('.header__profile-dropdown') as HTMLElement;
      if (el) {
        el.style.pointerEvents = 'none';
      }

      document.querySelector('.header__profile-dropdown__options__login').textContent = '';
      document.querySelector('.header__profile-dropdown__options__name').textContent = '';

      const avatarImage = document.getElementById(
        'header__profile-dropdown__image__avatar',
      ) as HTMLImageElement;
      avatarImage.onerror = () => {
        avatarImage.src = './src/assets/profile.png';
      };
      avatarImage.src = '';
      this.loginButton.show();
      this.profileButton.style.display = 'none';
    }

    this.isAuth = userStore.isAuth();
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
      this.addressComponents.forEach((comp) => comp.remove());
      this.addressComponents = [];
      this.addresses = [];
    } catch (error) {
      toasts.error(error.message);
    } finally {
      this.logoutButton.enable();
    }
  }

  setQuery(query: string | null = null): void {
    this.searchInput.setValue(query);
  }

  onSearchAllEnter = () => {
    if (!this.searchInput.value) {
      router.goToPage('home');
      return;
    }
    router.goToPage('searchPage', null, this.searchInput.value);
  };

  onSearch = async () => {
    await router.updateQuery(this.searchInput.value);
  };

  updateHeader(searchAll: boolean): void {
    if (this.searchAll !== undefined && this.searchAll === searchAll) {
      return;
    }
    this.searchAll = searchAll;
    if (searchAll) {
      this.searchButton.setOnSubmit(this.onSearchAllEnter);

      this.searchInput.setPlaceholder('Найти ресторан или блюдо');
      this.searchInput.setOnEnter(this.onSearchAllEnter);
      return;
    }

    this.searchButton.setOnSubmit(this.onSearch);
    this.searchInput.setOnEnter(this.onSearch);
    this.searchInput.setPlaceholder('Поиск по ресторану');
  }
  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove(): void {
    this.addressComponents.forEach((comp) => comp.remove());
    this.addressComponents = [];

    if (this.logo) this.logo.remove();
    this.profilesButtons.forEach((button) => button.remove());
    this.logoutButton?.remove();
    this.profileButton.remove();
    this.loginButton?.remove();
    this.searchButton?.remove();
    this.searchInput?.remove();
    if (this.cartButton) this.cartButton.remove();
    this.parent.innerHTML = '';
    this.parent.classList.remove('main_header');
    this.parent.classList.remove('mobile_header');
    this.profileButton.removeEventListener('click', this.toggleProfileDropdown);
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
