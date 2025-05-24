import template from './button.hbs';

export interface ButtonProps {
  id: string;
  text?: string;
  iconSrc?: string;
  iconAlt?: string;
  style?: string;
  insert?: InsertPosition;
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
      insert: props.insert || 'beforeend',
      iconSrc: props.iconSrc,
      iconAlt: props.iconAlt,
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
      event.stopPropagation();
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
   * Изменяет функцию обработчика события submit.
   * @param newOnSubmit - Новая функция обработчика.
   */
  setOnSubmit(newOnSubmit: () => void): void {
    this.props.onSubmit = newOnSubmit;

    const button = this.self;
    if (button) {
      this.props.onSubmit = newOnSubmit;
    }
  }

  /**
   * Рендерит кнопку в родительский элемент.
   */
  render(): void {
    const html = template(this.props);
    this.parent.insertAdjacentHTML(this.props.insert, html);

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
    const buttonText = this.self.querySelector('.button__text');
    if (buttonText) {
      buttonText.textContent = newText;
    }
  }

  /**
   * Изменяет иконку на кнопке.
   * @param iconSrc - Новый путь к изображению.
   * @param iconAlt - Новый alt-текст (опционально).
   */
  setIcon(iconSrc: string, iconAlt?: string): void {
    this.props.iconSrc = iconSrc;
    if (iconAlt !== undefined) {
      this.props.iconAlt = iconAlt;
    }

    const button = this.self;
    if (!button) return;

    let icon = button.querySelector('.button__icon') as HTMLImageElement | null;

    if (icon) {
      icon.src = iconSrc;
      if (iconAlt !== undefined) {
        icon.alt = iconAlt;
      }
    } else {
      icon = document.createElement('img');
      icon.className = 'button__icon';
      icon.src = iconSrc;
      icon.alt = iconAlt || '';
      button.insertBefore(icon, button.firstChild);
    }
  }

  /**
   * Показывает кнопку, устанавливая display в block.
   */
  show(): void {
    const button = this.self;
    if (button) {
      button.style.display = 'flex';
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
