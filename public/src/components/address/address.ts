import { Button, ButtonProps } from '../button/button';
import template from './address.hbs';
import { userStore } from '@store/userStore';

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
  private unsubscribeFromUserStore: (() => void) | null = null;
  protected clickHandler: (event: Event) => void;
  protected components: {
    buttons: Button[];
  };

  /**
   * @constructor Создает экземпляр адреса
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться адрес
   * @param props
   */
  constructor(parent: HTMLElement, props: AddressProps) {
    if (!parent) {
      throw new Error('Address: no parent!');
    }
    if (document.getElementById(props.id)) {
      throw new Error('Address: this id is already used!');
    }
    this.parent = parent;
    this.props = props;
    if (!this.props.isHeaderAddress) {
      this.unsubscribeFromUserStore = userStore.subscribe(() => this.updateState());
    }
    this.components = {
      buttons: [],
    };

    this.clickHandler = this.handleClick.bind(this);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find address`);
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
    const html = template(this.props);
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
  }

  /**
   * Обработчик нажатия на адрес.
   * @private
   */
  handleClick(): void {
    userStore.setAddress(this.props.address);
  }

  private updateState(): void {
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
  handleDelete(): void {
    // Добавить обработку удаления
  }

  getProps(): AddressProps {
    return this.props;
  }

  /**
   * Удаляет компонент адреса со страницы
   */
  remove(): void {
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
