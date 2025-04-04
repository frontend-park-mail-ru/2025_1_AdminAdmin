import { router } from '@modules/routing';
import { userStore } from '@store/userStore';
import { Logo } from '@components/logo/logo';
import { Button } from '@components/button/button';
import template from './header.hbs';
import { toasts } from '@modules/toasts';
import MapModal from '@pages/mapModal/mapModal';
import ModalController from '@modules/modalController';
import logoImg from '@assets/logo.png';

/**
 * Класс Header представляет основной заголовок страницы.
 * Он управляет навигацией и отображением кнопок входа/выхода в зависимости от состояния авторизации пользователя.
 */
export default class Header {
  private parent: HTMLElement;
  private logo!: Logo;
  private loginButton!: Button;
  private logoutButton!: Button;
  private readonly handleScrollBound: () => void;
  private readonly clickHandler: (event: Event) => void;
  private modalController: ModalController;

  /**
   * Создает экземпляр заголовка.
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.modalController = new ModalController();
    this.handleScrollBound = this.handleScroll.bind(this);
    userStore.subscribe(() => this.updateHeaderState());

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
      this.modalController.openModal(mapModal);
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
    const headerElement = this.self;
    if (!headerElement) return;

    this.logo = new Logo(headerElement, logoImg);
    this.logo.render();

    const buttonContainer = document.querySelector('.header__buttons') as HTMLElement;
    if (!buttonContainer) return;

    this.loginButton = new Button(buttonContainer, {
      id: 'login_button',
      text: 'Вход',
      onSubmit: () => {
        router.goToPage('loginPage');
      },
    });
    this.loginButton.render();

    this.logoutButton = new Button(buttonContainer, {
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
    const loginButton = this.loginButton?.self;
    const logoutButton = this.logoutButton?.self;
    const loginContainer = document.querySelector('.header__login') as HTMLElement;

    if (userStore.isAuth()) {
      if (loginButton) loginButton.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'block';

      if (loginContainer) {
        loginContainer.textContent = userStore.getState().login || '';
      }
    } else {
      if (loginButton) loginButton.style.display = 'block';
      if (logoutButton) logoutButton.style.display = 'none';

      if (loginContainer) {
        loginContainer.textContent = '';
      }
    }

    const activeAddress = userStore.getActiveAddress();
    if (activeAddress) {
      this.setButtonAddress(activeAddress);
      this.modalController.closeModal();
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
    this.parent.innerHTML = '';
    this.parent.classList.remove('main_header');
    this.modalController.remove();
    window.removeEventListener('scroll', this.handleScrollBound);
    document.removeEventListener('click', this.clickHandler);
  }
}
