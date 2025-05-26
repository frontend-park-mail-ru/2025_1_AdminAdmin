import { Address } from '@components/address/address';
import { Button, ButtonProps } from 'doordashers-ui-kit';
import { ProfileTable } from '@components/profileTable/profileTable';

import template from './profilePage.hbs';
import { User } from '@myTypes/userTypes';
import { userStore } from '@store/userStore';
import UnifiedForm from '@components/unifiedForm/unifiedForm';
import { AppOrderRequests, AppPromocodeRequests, AppUserRequests } from '@modules/ajax';
import { toasts } from 'doordashers-ui-kit';
import MapModal from '@pages/mapModal/mapModal';
import { modalController } from '@modules/modalController';
import { I_UserOrderResponse } from '@myTypes/orderTypes';
import { router } from '@modules/routing';
import { Pagination } from '@components/pagination/pagination';
import { PromocodeCard } from '@//components/promocodeCard/promocodeCard';
import { Checkbox } from '@components/checkbox/checkbox';
import { QRModal } from '@components/qrModal/qrModal';
import copyImg from '@assets/copy.svg';
import { UserState } from '@store/reducers/userReducer';

const ORDERS_PER_PAGE = 5;

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
  private addressChannel = new BroadcastChannel('cart_channel');
  private tabId = crypto.randomUUID();
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
  private promocodeCards: PromocodeCard[] = [];

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
      checked: userStore.getState().has_secret,
      onClick: this.handleTwoFactorUpdate,
    });
    this.components.twoFactorCheckbox.render();

    // Ренденрим блок изменения/удаления/добавления адресов
    await this.refreshAddresses();
    this.startSyncAcrossTabs();

    const profileAddressBody: HTMLDivElement = this.parent.querySelector('.profile-address__body');
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
            this.addressChannel.postMessage({ sender: this.tabId });
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

    // Рендерим блок промокодов
    await this.renderPromocodes();

    // Рендерим таблицу заказов
    try {
      await this.createProfileTable(0);

      if (!this.props.orders.total) {
        return;
      }

      const profileOrderWrapper: HTMLDivElement = this.parent.querySelector('.profile-orders');

      if (this.props.orders.total > ORDERS_PER_PAGE) {
        const profileTableWrapper = this.self.querySelector(
          '.profile-orders__table__wrapper',
        ) as HTMLElement;

        profileTableWrapper.style.minHeight = `${80 * (ORDERS_PER_PAGE + 1)}px`;

        this.components.pagination = new Pagination(
          profileOrderWrapper,
          Math.ceil(this.props.orders.total / ORDERS_PER_PAGE),
          this.handleOrdersPageChange,
        );

        this.components.pagination.render();
      }

      profileOrderWrapper.style.display = 'grid';
    } catch (error) {
      console.error(error);
    }
  }

  startSyncAcrossTabs = () => {
    this.addressChannel.onmessage = async (event) => {
      const { sender } = event.data;

      if (sender === this.tabId) return;
      await this.refreshAddresses();
    };
  };

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

    this.components.ordersTable = new ProfileTable(
      profileTableWrapper,
      ORDERS_PER_PAGE,
      this.props.orders.orders,
    );
    this.components.ordersTable.render();
  };

  private updateState() {
    if (this.props.data.path !== userStore.getState().path) {
      this.props.data.path = userStore.getState().path;
      const avatarImageElement = document.getElementById(
        'profile-data__avatar-image',
      ) as HTMLImageElement;
      avatarImageElement.src = `https://doordashers.ru/images_user/${this.props.data.path}`;
    }

    const state = userStore.getState();
    const inputs = this.components.profileForm.inputs;

    for (const [key, input] of Object.entries(inputs)) {
      const storeValue = state[key as keyof UserState];

      if (!storeValue) {
        continue;
      }

      let stringValue = storeValue.toString();

      if (key === 'phone_number') {
        stringValue = stringValue.slice(1);
      }

      const inputValue = input.value;

      if (inputValue !== stringValue) {
        input.setValue(stringValue);
      }
    }

    this.components.twoFactorCheckbox.setChecked(state.has_secret);
  }

  private handleTwoFactorUpdate = async () => {
    if (!this.components.twoFactorCheckbox.isChecked) {
      try {
        await userStore.revokeSecret();
        toasts.success('2FA успешно отключена');
      } catch (error) {
        this.components.twoFactorCheckbox.setChecked(true);
        toasts.error(error.message);
      }
      return;
    }

    try {
      const qrBlob = await userStore.setSecret();
      const qrUrl = URL.createObjectURL(qrBlob);

      const qrModal = new QRModal(qrUrl);
      modalController.openModal(qrModal);
    } catch (error) {
      this.components.twoFactorCheckbox.setChecked(false);
      toasts.error(error.message);
    }
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
            () => {
              this.refreshAddresses();
              this.addressChannel.postMessage({ sender: this.tabId });
            },
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

  private async renderPromocodes() {
    const promocodesElement: HTMLDivElement = this.parent.querySelector('.profile-promocodes');
    const promocodesBodyElement: HTMLDivElement = this.parent.querySelector(
      '.profile-promocodes__body',
    );

    try {
      const promocodes = await AppPromocodeRequests.GetPromocodes();

      if (!Array.isArray(promocodes) || promocodes.length === 0) return;

      promocodes.forEach((promocode) => {
        const promocodeCardComponent = new PromocodeCard(
          promocodesBodyElement,
          promocode,
          this.handlePromocodeCopied,
        );
        promocodeCardComponent.render();
        this.promocodeCards.push(promocodeCardComponent);
      });

      promocodesElement.style.display = 'flex';
    } catch (error) {
      toasts.error(error.message);
    }
  }

  private handlePromocodeCopied = (copiedId: string) => {
    for (const card of this.promocodeCards) {
      if (card.props.id !== copiedId) {
        card.setIcon(copyImg);
      }
    }
  };

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

    this.promocodeCards.forEach((card) => {
      card.remove();
    });

    this.promocodeCards = [];
    this.components.ordersTable?.remove();
    this.components.pagination?.remove();

    this.addressChannel.close();

    const element = this.self;
    if (element) element.remove();
  }
}
