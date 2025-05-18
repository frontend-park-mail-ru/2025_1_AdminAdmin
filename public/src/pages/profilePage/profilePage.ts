import { Address } from '@components/address/address';
import { Button, ButtonProps } from '@components/button/button';
import { ProfileTable } from '@components/profileTable/profileTable';

import template from './profilePage.hbs';
import { User } from '@myTypes/userTypes';
import { userStore } from '@store/userStore';
import UnifiedForm from '@components/unifiedForm/unifiedForm';
import { AppOrderRequests, AppUserRequests } from '@modules/ajax';
import { toasts } from '@modules/toasts';
import MapModal from '@pages/mapModal/mapModal';
import { modalController } from '@modules/modalController';
import { I_UserOrderResponse } from '@myTypes/orderTypes';
import { router } from '@modules/routing';
import { Pagination } from '@components/pagination/pagination';
import { Checkbox } from '@components/checkbox/checkbox';
import { QRModal } from '@components/qrModal/qrModal';

const ORDERS_PER_PAGE = 10;

interface ProfilePageProps {
  data?: User;
  orders?: I_UserOrderResponse;
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
    addAddressButton?: Button;
    ordersTable?: ProfileTable;
    pagination?: Pagination;
    twoFactorCheckbox: Checkbox;
  };
  private readonly avatarChangeHandler: (event: Event) => void; // Функция при изменении файла аватарки
  private unsubscribeFromUserStore: (() => void) | null = null;
  private previousAddressMap = new Map<string, Address>();

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
    };

    this.components = {
      loadAvatarButton: undefined,
      profileForm: undefined,
      addAddressButton: undefined,
      ordersTable: undefined,
      twoFactorCheckbox: undefined,
    };
    this.unsubscribeFromUserStore = userStore.subscribe(() => this.updateState());
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
      router.goBack();
      return;
    }

    // Генерируем HTML
    const html = template({ path: this.props.data.path });
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

    const checkboxWrapper: HTMLDivElement = this.parent.querySelector('.profile-data__checkbox');
    this.components.twoFactorCheckbox = new Checkbox(checkboxWrapper, {
      id: 'profile-data__twoFactorCheckbox',
      label: 'Двухфакторная аутентификация',
      onClick: this.handleTwoFactorUpdate,
    });
    this.components.twoFactorCheckbox.render();

    // Ренденрим блок изменения/удаления/добавления адресов
    await this.refreshAddresses();

    const profileAddressBody: HTMLDivElement = this.self.querySelector('.profile-address__body');
    const addAddressButtonProps = {
      id: 'profile-page__address-add',
      text: 'Добавить',
      onSubmit: () => {
        if (this.previousAddressMap.size > 10) {
          toasts.error('У Вас максимальное количество адресов.');
          return;
        }
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

    try {
      await this.createProfileTable(0);

      if (!this.props.orders.total) {
        this.hideProfileOrders();
        return;
      }

      if (this.props.orders.total > ORDERS_PER_PAGE) {
        const profileOrderWrapper: HTMLDivElement = this.parent.querySelector('.profile-orders');
        this.components.pagination = new Pagination(
          profileOrderWrapper,
          Math.ceil(this.props.orders.total / ORDERS_PER_PAGE),
          this.handleOrdersPageChange,
        );

        this.components.pagination.render();
      }
    } catch (error) {
      console.error(error);
      this.hideProfileOrders();
    }
  }

  handleOrdersPageChange = async (pageNumber: number) => {
    this.components.ordersTable.remove();
    await this.createProfileTable((pageNumber - 1) * ORDERS_PER_PAGE);
  };

  createProfileTable = async (offset: number) => {
    this.props.orders = await AppOrderRequests.getUserOrders(ORDERS_PER_PAGE, offset);
    // Рендерим блок таблицы заказов
    const profileTableWrapper = this.self.querySelector(
      '.profile-orders__table__wrapper',
    ) as HTMLElement;

    this.components.ordersTable = new ProfileTable(profileTableWrapper, this.props.orders.orders);
    this.components.ordersTable.render();
  };

  hideProfileOrders() {
    const profileOrdersContainer: HTMLDivElement = this.self.querySelector('.profile-orders');
    profileOrdersContainer.style.display = 'none';
  }

  private updateState() {
    if (this.props.data.path !== userStore.getState().path) {
      this.props.data.path = userStore.getState().path;
      const avatarImageElement = document.getElementById(
        'profile-data__avatar-image',
      ) as HTMLImageElement;
      avatarImageElement.src = `https://doordashers.ru/images_user/${this.props.data.path}`;
    }
  }

  private handleTwoFactorUpdate = () => {
    if (this.components.twoFactorCheckbox.isChecked) return;
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?data=test123&format=svg';

    const qrModal = new QRModal(qrUrl);
    modalController.openModal(qrModal);
  };

  private async refreshAddresses() {
    const wrapper: HTMLElement = this.self.querySelector('.profile-address__addresses__wrapper');

    try {
      const addresses = await AppUserRequests.GetAddresses();

      if (!Array.isArray(addresses)) {
        for (const [id, comp] of this.previousAddressMap.entries()) {
          comp.close();
          this.previousAddressMap.delete(id);
        }
        return;
      }

      const currentAddressIds = new Set(addresses.map((a) => a.id));

      for (const [id, comp] of this.previousAddressMap.entries()) {
        if (!currentAddressIds.has(id)) {
          comp.close();
          this.previousAddressMap.delete(id);
        }
      }

      addresses.forEach((props) => {
        if (!this.previousAddressMap.has(props.id)) {
          const comp = new Address(
            wrapper,
            {
              ...props,
              isHeaderAddress: false,
            },
            () => this.refreshAddresses(),
          );
          comp.render();
          this.previousAddressMap.set(props.id, comp);
        }
      });
    } catch (error) {
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

    // Если получили файл
    if (avatarInputElement.files && avatarInputElement.files[0]) {
      const file = avatarInputElement.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      try {
        await userStore.SetAvatar(file);
      } catch (error) {
        toasts.error(error);
        // Возвращаем стандартное изображение
        avatarImageElement.src = './src/assets/profile.png';
      }
    }
  }

  /**
   * Удаляет страницу профиля
   */
  remove(): void {
    if (this.components.addAddressButton) this.components.addAddressButton.remove();
    if (this.components.profileForm) this.components.profileForm.remove();
    if (this.unsubscribeFromUserStore) {
      this.unsubscribeFromUserStore();
      this.unsubscribeFromUserStore = null;
    }

    for (const address of this.previousAddressMap.values()) {
      address.remove();
    }
    this.previousAddressMap.clear();
    this.components.ordersTable?.remove();
    this.components.pagination?.remove();
    const element = this.self;
    if (element) element.remove();
  }
}
