import { Button, ButtonProps } from '@components/button/button';
import template from './quantityButton.hbs';

export interface QuantityButtonProps extends Omit<ButtonProps, 'text'> {
  isPlus: boolean;
}

/**
 * Класс кнопки изменения количества
 */
export class QuantityButton extends Button {
  declare protected props: QuantityButtonProps & { text: string };

  constructor(parent: HTMLElement, props: QuantityButtonProps) {
    const isPlus = props.isPlus;
    const text = isPlus ? '+' : '−';

    super(parent, {
      ...props,
      text,
    });

    this.props = {
      ...props,
      insert: props.insert || 'beforeend',
      isPlus,
      text,
    };
  }

  render(): void {
    if (!template) {
      throw new Error('Error: quantity-button template not found');
    }
    const html = template(this.props);
    this.parent.insertAdjacentHTML(this.props.insert, html);

    const quantityButtonComponent = this.self;
    if (this.props.style) {
      const styles = this.props.style.split(' ');
      quantityButtonComponent.classList.add(...styles);
    }
    quantityButtonComponent.disabled = this.props.disabled;
    quantityButtonComponent.addEventListener('click', this.clickHandler);
  }
}
