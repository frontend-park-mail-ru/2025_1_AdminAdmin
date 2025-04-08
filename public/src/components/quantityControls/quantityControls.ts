import { QuantityButton } from '@components/quantityButton/quantityButton';
import template from './quantityControls.hbs';

export class QuantityControls {
  private readonly parent: HTMLElement;
  private readonly id: string;
  private plusButton: QuantityButton;
  private input: HTMLInputElement;
  private minusButton: QuantityButton;
  private readonly amount: number;
  private onIncrement: () => void;
  private onDecrement: () => void;
  private readonly setProductAmount: (amount: number) => void;

  constructor(
    parent: HTMLElement,
    id: string,
    amount: number,
    onIncrement: () => void,
    onDecrement: () => void,
    setProductAmount: (amount: number) => void,
  ) {
    this.parent = parent;
    this.id = id;
    this.amount = amount;
    this.onIncrement = onIncrement;
    this.onDecrement = onDecrement;
    this.setProductAmount = setProductAmount;
  }

  get self(): HTMLElement {
    const element = document.getElementById(`${this.id}__quantity-controls`);
    if (!element) {
      throw new Error(`Error: can't find ${this.id}__quantity-controls`);
    }
    return element as HTMLButtonElement;
  }

  private handleInputChange = (): void => {
    if (this.input.value.length > 3) {
      this.input.value = this.input.value.slice(0, 3);
    }
  };

  private handleInputBlur = (): void => {
    const newAmount = Number(this.input.value);
    if (newAmount !== this.amount) {
      this.setProductAmount(newAmount);
    }
  };

  // Новый метод для обработки нажатия Enter
  private handleInputKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter') {
      this.input.blur();
    }
  };

  render() {
    if (!template) {
      throw new Error('Error: template not found');
    }

    const html = template({ id: this.id });
    this.parent.insertAdjacentHTML('beforeend', html);

    this.minusButton = new QuantityButton(this.self, {
      id: `${this.id}__quantity_controls__minus-button`,
      style: 'cart-card-quantity-button',
      text: '−',
      isMinus: true,
      onSubmit: this.onDecrement.bind(this),
    });
    this.minusButton.render();

    this.input = document.createElement('input');
    this.input.type = 'number';
    this.input.value = this.amount.toString();
    this.input.addEventListener('input', this.handleInputChange);
    this.input.addEventListener('blur', this.handleInputBlur);
    this.input.addEventListener('keydown', this.handleInputKeydown);
    this.input.classList.add('quantity-controls__input');
    this.self.appendChild(this.input);

    this.plusButton = new QuantityButton(this.self, {
      id: `${this.id}__quantity_controls__plus-button`,
      style: 'cart-card-quantity-button',
      text: '+',
      isPlus: true,
      onSubmit: this.onIncrement.bind(this),
    });
    this.plusButton.render();
  }

  remove() {
    this.minusButton.remove();
    this.input.removeEventListener('input', this.handleInputChange);
    this.input.removeEventListener('blur', this.handleInputBlur);
    this.input.removeEventListener('keydown', this.handleInputKeydown);
    this.plusButton.remove();
    this.self.remove();
  }
}
