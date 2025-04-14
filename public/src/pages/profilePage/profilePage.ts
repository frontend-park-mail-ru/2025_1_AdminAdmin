import { Address } from '@components/address/address';
import { Button, ButtonProps } from '@components/button/button';
import { ProfileTable } from '@components/profileTable/profileTable';

import template from './profilePage.hbs';
import { User } from '@myTypes/userTypes';
import { userStore } from '@store/userStore';
import UnifiedForm from '@components/unifiedForm/unifiedForm';
import { AppUserRequests } from '@modules/ajax';
import { toasts } from '@modules/toasts';
import MapModal from '@pages/mapModal/mapModal';
import { modalController } from '@modules/modalController';

interface ProfilePageProps {
  data?: User;
  //orders?: ProfileTableProps;
}

/**
 * Класс страницы профиля
 */
export default class ProfilePage {
  private parent: HTMLElement;
  private props: ProfilePageProps;
  private components: {
    loadAvatarButton: Button;
    profileForm?: UnifiedForm;
    addresses: Address[];
    addAddressButton?: Button;
    ordersTable?: ProfileTable;
  };
  private avatarChangeHandler: (event: Event) => void; // Функция при изменении файла аватарки
  // Поля необязательные чтобы можно было создать пустой объект

  /**
   * Создает экземпляр страницы профиля
   * @param parent - Родительский элемент, в который будет рендериться страница профиля
   */
  constructor(parent: HTMLElement) {
    if (!parent) {
      throw new Error('ProfilePage: no parent!');
    }
    this.parent = parent;

    this.props = {
      data: userStore.getState(),
      // orders: [],
    };

    this.components = {
      loadAvatarButton: undefined,
      profileForm: undefined,
      addresses: [],
      addAddressButton: undefined,
      ordersTable: undefined,
    };
    this.avatarChangeHandler = this.handleAvatarChange.bind(this);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement | null {
    const element = document.querySelector('.profile-page__body');
    return element as HTMLElement | null;
  }

  /**
   * Рендерит информацию о ресторане.
   * Запрашивает данные ресторана по ID и отображает их на странице.
   */
  async render(): Promise<void> {
    if (!userStore.isAuth()) {
      setTimeout(() => {
        import('@modules/routing').then(({ router }) => {
          router.goToPage('home');
        });
      }, 0);
      return;
    }
    if (!template) {
      throw new Error('Error: profile page template not found');
    }
    try {
      // Генерируем HTML
      const html = template();
      this.parent.insertAdjacentHTML('beforeend', html);
      // Заполняем
      // Если оставляем категории то тут рендерим категории, у них свой враппер
      // Рендерим блок изменения данных профиля
      this.components.loadAvatarButton = new Button(
        document.getElementById('profile-data__avatar-load-button__wrapper'),
        {
          id: 'profile-data__load-avatar-button',
          text: 'Загрузить аватар',
          onSubmit: () => {
            const avatarInputElement = document.getElementById(
              'profile-data__avatar-input',
            ) as HTMLInputElement;
            avatarInputElement.click(); // Нажимаем на инпут чтобы выбрать файл
          },
        },
      );
      this.components.loadAvatarButton.render();
      const profileFormElement: HTMLDivElement = this.self.querySelector('.profile-data__body');
      const profileFormComponent = new UnifiedForm(profileFormElement, true);
      profileFormComponent.render();
      this.components.profileForm = profileFormComponent;

      // Ренденрим блок изменения/удаления/добавления адресов
      await this.refreshAddresses();

      const profileAddressBody: HTMLDivElement = this.self.querySelector('.profile-address__body');
      const addAddressButtonProps = {
        id: 'profile-page__address-add',
        text: 'Добавить',
        onSubmit: () => {
          const mapModal = new MapModal(async (newAddress: string) => {
            try {
              await userStore.addAddress(newAddress);
              modalController.closeModal();
              await this.refreshAddresses();
            } catch (error) {
              toasts.error(error);
            }
          });

          modalController.openModal(mapModal);
        },
      } as ButtonProps;

      const addAddressButtonComponent = new Button(profileAddressBody, addAddressButtonProps);
      addAddressButtonComponent.render();
      this.components.addAddressButton = addAddressButtonComponent;
      const avatarInputElement = document.getElementById(
        'profile-data__avatar-input',
      ) as HTMLInputElement;
      avatarInputElement.addEventListener('change', this.avatarChangeHandler);

      /*      // Рендерим блок таблицы заказов
      const profileTableWrapper = this.self.querySelector(
        '.profile-orders__table__wrapper',
      ) as HTMLElement;
      const ordersTableComponent = new ProfileTable(profileTableWrapper, this.props.orders);
      ordersTableComponent.render();
      this.components.ordersTable = ordersTableComponent;*/
    } catch (error) {
      console.error(error);
      console.error('Error rendering profile page:', error);
    }
  }

  private async refreshAddresses() {
    const profileAddressesWrapper: HTMLDivElement = this.self.querySelector(
      '.profile-address__addresses__wrapper',
    );

    // Удаляем старые компоненты
    this.components.addresses.forEach((addressComponent) => addressComponent.remove());
    this.components.addresses = [];

    try {
      const addresses = await AppUserRequests.GetAddresses();
      if (Array.isArray(addresses)) {
        addresses.forEach((props) => {
          const addressComponent = new Address(
            profileAddressesWrapper,
            {
              ...props,
              isHeaderAddress: false,
            },
            () => {
              this.refreshAddresses();
            },
          );
          addressComponent.render();
          this.components.addresses.push(addressComponent);
        });
      }
    } catch (error) {
      console.error(error);
      toasts.error(error.message);
    }
  }

  async handleAvatarChange(): Promise<void> {
    const avatarImageElement = document.getElementById(
      'profile-data__avatar-image',
    ) as HTMLImageElement;
    const avatarInputElement = document.getElementById(
      'profile-data__avatar-input',
    ) as HTMLInputElement;

    // Проверяем наличие токена
    const authToken = localStorage.getItem('X-CSRF-Token');
    if (!authToken) {
      alert('Вы не авторизованы. Пожалуйста, войдите в систему.');
      window.location.href = '/login'; // Перенаправляем на страницу входа
      return;
    }

    // Если получили файл
    if (avatarInputElement.files && avatarInputElement.files[0]) {
      const file = avatarInputElement.files[0];
      const reader = new FileReader();

      // Читаем файл как DataURL
      reader.onload = (event) => {
        avatarImageElement.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);

      try {
        // Создаем FormData для запроса
        const formData = new FormData();
        formData.append('picture', file);
        // Отправляем аватарку на сервер
        const response = await AppUserRequests.SetAvatar(formData);

        if (response.message !== 'success') {
          throw new Error('Вернулась ошибка');
        }
      } catch (error) {
        console.error('Ошибка при обновлении аватара:', error);
        // Возвращаем стандартное изображение
        avatarImageElement.src = './src/assets/profile.png'; // Укажите путь к текущему аватару
      }
    }
  }

  /**
   * Удаляет страницу профиля
   */
  remove(): void {
    if (this.components.addAddressButton) this.components.addAddressButton.remove();
    if (this.components.profileForm) this.components.profileForm.remove();
    //this.components.ordersTable.remove();
    /*    this.components.addresses.forEach((component) => {
      component.remove();
    });*/
    const element = this.self;
    if (element) element.remove();
  }
}
