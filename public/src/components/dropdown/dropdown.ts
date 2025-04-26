import template from './Dropdown.hbs';

export interface DropdownProps {
  id: string; // Уникальный идентификатор
  text: string; // Текст в хедере дропдауна
  style?: string; // Для доп стилей, кидаются в style (это не класс)
}

export class Dropdown {
  protected parent: HTMLElement;
  protected clickHandler: (event: Event) => void;
  protected props: DropdownProps;

  /**
   * Создает экземпляр дропдауна
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться дропдаун
   * @param props - Словарь данных для определения свойств дропдауна
   */
  constructor(parent: HTMLElement, props: DropdownProps) {
    if (!parent) {
      throw new Error('Dropdown: no parent!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      text: props.text,
      style: props.style || '',
    };

    this.clickHandler = this.handleClick.bind(this);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLDivElement} - ссылка на объект
   */
  get self(): HTMLDivElement | null {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find Dropdown with id ${this.props.id}`);
    }
    return element as HTMLDivElement;
  }

  /**
   * Обработчик нажатия на заголовок дропдауна
   * @private
   */
  private handleClick(event: Event): void {
    event.preventDefault();
    const dropdownElement = this.self;
    if (dropdownElement) {
      dropdownElement.classList.toggle('open');
    }
  }

  /**
   * Рендерит дропдаун в родительский элемент
   */
  render(): void {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    const dropdownElement = this.self;
    if (dropdownElement) {
      if (this.props.style) {
        dropdownElement.classList.add(...this.props.style.split(' '));
      }

      const headerElement = dropdownElement.querySelector('.dropdown__header');
      headerElement.addEventListener('click', this.clickHandler);
    }
  }

  /**
   * Удаляет дропдаун со страницы и снимает обработчик событий
   */
  remove(): void {
    const dropdownElement = this.self;
    if (dropdownElement) {
      const headerElement = dropdownElement.querySelector('.dropdown__header');
      headerElement.removeEventListener('click', this.clickHandler);
      dropdownElement.remove();
    }
  }
}
