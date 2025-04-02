import { Button, ButtonProps } from '../button/button';

import template from './quantityButton.hbs';

// Структура класса кнопки изменения количества (нужно для конструктора)
export interface QuantityButtonProps extends ButtonProps {
  // ? - необязательное поле
  isPlus?: boolean;
  isMinus?: boolean;
}

/**
 * Класс кнопки изменения количества
 */
export class QuantityButton extends Button {
  declare protected props: QuantityButtonProps;

  /**
   *Создает экземпляр кнопки изменения количества
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться кнопка изменения количества
   * @param {Object} props - Словарь данных для определения свойств кнопки
   */
  constructor(parent: HTMLElement, props: QuantityButtonProps) {
    // Вызов родительского конструктора
    super(parent, props);
    this.props = {
      ...this.props,
      isPlus: props.text === '+',
      isMinus: props.text === '-',
    };

    if (this.props.text !== '+' && this.props.text !== '-') {
      // Предупреждение
      console.warn(`QuantityButton: invalid text=${this.props.text} must be '+' or '-'`);
    }
  }

  /**
   * Рендерит кнопку изменения количества на странице.
   */
  render(): void {
    if (!template) {
      throw new Error('Error: quantity-button template not found');
    }
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    const quantityButtonComponent = this.self;
    if (this.props.style) {
      // Если есть доп классы стилей
      const styles = this.props.style.split(' ');
      quantityButtonComponent.classList.add(...styles);
    }
    quantityButtonComponent.disabled = this.props.disabled; // Если disabled, то скрываем кнопку
    quantityButtonComponent.addEventListener('click', this.clickHandler);
  }
}
