import template from './button.hbs';

export interface ButtonProps {
  id: string;
  text: string;
  style?: string;
  onSubmit?: () => void;
  disabled?: boolean;
  type?: string;
}

export class Button {
  protected parent: HTMLElement;
  protected clickHandler: (event: Event) => void;
  protected props: ButtonProps;

  /**
   * Создает экземпляр кнопки.
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться кнопка.
   * @param props - Словарь данных для определения свойств кнопки.
   */
  constructor(parent: HTMLElement, props: ButtonProps) {
    if (!parent) {
      throw new Error('Button: no parent!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      text: props.text,
      style: props.style,
      onSubmit: props.onSubmit,
      disabled: props.disabled || false,
      type: props.type,
    };

    this.clickHandler = this.handleClick.bind(this);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLButtonElement | null {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find button with id ${this.props.id}`);
    }
    return element as HTMLButtonElement;
  }

  /**
   * Обработчик нажатия на кнопку.
   * @private
   */
  private handleClick(event: Event): void {
    event.preventDefault();
    if (this.props.onSubmit !== undefined) {
      this.props.onSubmit();
    }
  }

  enable() {
    this.self.removeAttribute('disabled');
  }

  disable() {
    this.self.setAttribute('disabled', '');
  }

  /**
   * Рендерит кнопку в родительский элемент.
   */
  render(): void {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    if (!this.parent) {
      throw new Error('Button: invalid self!');
    }

    const button = this.self;
    if (button) {
      if (this.props.style) {
        button.classList.add(...this.props.style.split(' '));
      }
      button.disabled = this.props.disabled || false;
      button.addEventListener('click', this.clickHandler);
    }
  }

  /**
   * Удаляет кнопку со страницы и снимает обработчики событий.
   */
  remove(): void {
    const button = this.self;
    if (button) {
      button.removeEventListener('click', this.clickHandler);
      button.remove();
    }
  }

  /**
   * Метод для переключения CSS-класса.
   * @param oldClass - Текущий класс, который нужно удалить.
   * @param newClass - Новый класс, который нужно добавить.
   */
  toggleClass(oldClass: string, newClass: string): void {
    const button = this.self;
    if (button) {
      button.classList.remove(oldClass);
      button.classList.add(newClass);
    }
  }

  /**
   * Изменяет текст кнопки.
   * @param newText - Новый текст, который будет установлен на кнопке.
   */
  setText(newText: string): void {
    const button = this.self;
    if (button) {
      button.textContent = newText;
    }
  }

  /**
   * Показывает кнопку, устанавливая display в block.
   */
  show(): void {
    const button = this.self;
    if (button) {
      button.style.display = 'block';
    }
  }

  /**
   * Скрывает кнопку, устанавливая display в none.
   */
  hide(): void {
    const button = this.self;
    if (button) {
      button.style.display = 'none';
    }
  }
}
