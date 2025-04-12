import { Button, ButtonProps } from '../button/button';
import template from './address.hbs';

/**
 * @interface Интерфейс для компонента адреса
 * @property {string} id - Уникальный идентификатор адреса
 * @property {string} text - Адрес в текстовом виде
 * @property {boolean} isChecked? - Флаг, указывающий, выбран ли этот адрес
 * @property {function(clickedAddress: Address): void} onSubmit? - Функция, вызываемая при нажатии на адрес
 * @example
 * const props: AddressProps  = {
 *   id: "myaddress1",
 *   text: "ул. Пушкина д.1",
 *   isChecked: true,
 *   onSubmit: (clickedAddress) => {console.log(clickedAddrerss.getProps().text)},
 * };
 */
export interface AddressProps {
  // ? - необязательное поле
  id: string;
  text: string;
  isChecked?: boolean;
  onSubmit?: (clickedAddress: Address) => void; // Функция при нажатии
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
  protected clickHandler: (event: Event) => void; // Функция при нажатии на радио-кнопку (·)
  protected hoverHandler: (event: Event) => void; // Функция при наведении на адрес
  protected components: {
    // Список компонентов
    buttons: Button[];
  };

  /**
   * @constructor Создает экземпляр адреса
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться адрес
   * @param {CategoriesProps} props - Словарь данных для определения свойств адреса
   */
  constructor(parent: HTMLElement, props: AddressProps) {
    if (!parent) {
      throw new Error('Address: no parent!');
    }
    if (document.getElementById(props.id)) {
      throw new Error('Address: this id is already used!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      text: props.text,
      isChecked: props.isChecked ?? false,
      onSubmit: props.onSubmit || undefined,
    };
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

    const editButtonProps = {
      id: `${this.props.id}__edit-button`,
      text: 'Редактировать',
      onSubmit: () => this.handleEdit(),
    } as ButtonProps;
    const editButtonComponent = new Button(buttonGroupElement, editButtonProps);
    editButtonComponent.render();

    this.components.buttons.push(editButtonComponent);
    const delButtonProps = {
      id: `${this.props.id}__del-button`,
      text: 'Удалить',
      onSubmit: () => this.handleDelete(),
    } as ButtonProps;
    const delButtonComponent = new Button(buttonGroupElement, delButtonProps);
    delButtonComponent.render();

    this.components.buttons.push(delButtonComponent);
    const radioElement = this.self.querySelector('input[type="radio"]');
    radioElement.addEventListener('click', this.clickHandler);
    this.self.addEventListener('mouseenter', this.hoverHandler);
    this.self.addEventListener('mouseleave', this.hoverHandler);
  }

  /**
   * Обработчик нажатия на адрес.
   * @private
   */
  handleClick(event: Event): void {
    event.preventDefault();
    if (this.props.onSubmit !== undefined) {
      this.props.onSubmit(this);
    }
  }

  /**
   * Обработчки нажатия на кнопку изменения адреса
   * @param event Event
   */
  handleEdit(): void {
    // Добавить модалку
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
    while (this.components.buttons.length > 0) {
      this.components.buttons.pop().remove();
    }
    element.remove();
  }
}
