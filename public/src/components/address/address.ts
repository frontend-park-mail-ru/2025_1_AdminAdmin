import { Button, ButtonProps } from '../button/button';
import template from './address.hbs';
import { userStore } from '@store/userStore';
import { AppUserRequests } from '@modules/ajax';
import { toasts } from '@modules/toasts';

/**
 * @interface Интерфейс для компонента адреса
 * @property {string} id - Уникальный идентификатор адреса
 * @property {string} address - Адрес в текстовом виде
 * @property {boolean} isChecked? - Флаг, указывающий, выбран ли этот адрес
 * @property {function(clickedAddress: Address): void} onSubmit? - Функция, вызываемая при нажатии на адрес
 * @example
 * const props: AddressProps  = {
 *   id: "myaddress1",
 *   address: "ул. Пушкина д.1",
 *   isChecked: true,
 *   onSubmit: (clickedAddress) => {console.log(clickedAddrerss.getProps().address)},
 * };
 */
export interface AddressProps {
  // ? - необязательное поле
  id: string;
  address: string;
  isHeaderAddress: boolean;
}

/**
 * @class Класс компонента адреса
 * @property {HTMLElement} parent - родительский компонент где будет рендериться
 * @property {AddressProps} props - пропсы
 * @property {function(event: Event) : void} clickHandler - хендлер при нажатии
 * @property {Array<Button>} componentsList - список дочерних компонентов
 */
export class Address {
  protected parent: HTMLElement; // Родитель (где вызывается)
  protected props: AddressProps; // Свойства
  private isDestroyed = false;
  private unsubscribeFromUserStore: (() => void) | null = null;
  private readonly onDelete?: () => void = null;
  protected components: {
    buttons: Button[];
  };

  /**
   * @constructor Создает экземпляр адреса
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться адрес
   * @param props
   * @param onDelete
   */
  constructor(parent: HTMLElement, props: AddressProps, onDelete?: () => void) {
    if (!parent) {
      throw new Error('Address: no parent!');
    }
    if (document.getElementById(props.id)) {
      throw new Error('Address: this id is already used!');
    }
    this.parent = parent;
    this.props = props;
    this.onDelete = onDelete;
    if (!this.props.isHeaderAddress) {
      this.unsubscribeFromUserStore = userStore.subscribe(() => this.updateState());
    }
    this.components = {
      buttons: [],
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const elementId = this.props.isHeaderAddress
      ? `header-${this.props.id}`
      : `address-${this.props.id}`;

    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Error: can't find address with id: ${elementId}`);
    }

    return element as HTMLElement;

    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Отображает адрес на странице.
   */
  render(): void {
    if (!template) {
      throw new Error('Error: address template not found');
    }
    // Рендерим шаблончик с данными
    const baseId = this.props.isHeaderAddress
      ? `header-${this.props.id}`
      : `address-${this.props.id}`;
    const radioId = `${baseId}-radio`;

    const html = template({
      id: this.props.id,
      addressName: this.props.address.toString(),
      isHeaderAddress: this.props.isHeaderAddress,
      baseId,
      radioId,
    });

    this.parent.insertAdjacentHTML('beforeend', html);
    // Заполняем
    const buttonGroupElement = this.self.querySelector('.address__button-group') as HTMLElement;

    if (!this.props.isHeaderAddress) {
      const delButtonProps = {
        id: `${this.props.id}__del-button`,
        text: 'Удалить',
        onSubmit: () => this.handleDelete(),
      } as ButtonProps;
      const delButtonComponent = new Button(buttonGroupElement, delButtonProps);
      delButtonComponent.render();
      this.components.buttons.push(delButtonComponent);
    }

    this.self.addEventListener('click', this.handleClick);

    if (!this.props.isHeaderAddress) this.updateState();
  }

  /**
   * Обработчик нажатия на адрес.
   * @private
   */
  handleClick = () => {
    userStore.setAddress(this.props.address);
  };

  private updateState(): void {
    if (this.isDestroyed) return;
    const radio = this.self.querySelector('input[type="radio"]') as HTMLInputElement | null;
    if (!radio) {
      console.error('Address: Radio input not found!');
      return;
    }

    radio.checked = userStore.getActiveAddress() === this.props.address;
  }

  /**
   * Обработчки нажатия на кнопку удаления адреса
   * @param event Event
   */
  async handleDelete(): Promise<void> {
    try {
      await AppUserRequests.DeleteAddress(this.props.id);
      if (userStore.getActiveAddress() === this.props.address) {
        userStore.setAddress('');
      }
      this.onDelete();
    } catch (error) {
      toasts.error(error.message);
    }
  }

  close() {
    this.self.animate(
      [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(100%)' },
      ],
      {
        duration: 500,
        easing: 'linear',
        fill: 'forwards',
      },
    );

    setTimeout(() => {
      this.remove();
    }, 500);
  }
  /**
   * Удаляет компонент адреса со страницы
   */
  remove(): void {
    this.isDestroyed = true;

    const element = this.self;
    element.removeEventListener('click', this.handleClick);
    if (this.unsubscribeFromUserStore) {
      this.unsubscribeFromUserStore();
      this.unsubscribeFromUserStore = null;
    }
    while (this.components.buttons.length > 0) {
      this.components.buttons.pop().remove();
    }
    element.remove();
  }
}
