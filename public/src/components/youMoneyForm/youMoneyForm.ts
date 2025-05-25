import template from './youMoneyForm.hbs';
import { Button } from 'doordashers-ui-kit';

/**
 * Класс, представляющий форму для ЮMoney.
 */
export default class YouMoneyForm {
  private parent: HTMLElement;
  private readonly amount: number;
  private submitBtn: Button;
  private orderId: string;

  get self(): HTMLElement {
    const element = this.parent.querySelector('.payment-form');
    if (!element) {
      throw new Error(`youMoneyForm не найдена!`);
    }
    return element as HTMLElement;
  }

  /**
   * Конструктор класса
   * @constructor
   * @param parent {HTMLElement} - родительский элемент
   * @param amount
   * @param orderId
   */
  constructor(parent: HTMLElement, amount: number, orderId: string) {
    this.parent = parent;
    this.amount = amount;
    this.orderId = orderId;
  }

  /**
   * Рендеринг формы
   */
  render() {
    this.parent.insertAdjacentHTML(
      'beforeend',
      template({ amount: this.amount, orderId: this.orderId }),
    );

    this.submitBtn = new Button(this.self, {
      id: 'payment-form__submit-btn',
      style: 'button_active',
      type: 'button',
      text: 'Перейти к оплате',
      onSubmit: async () => {
        const form = this.self as HTMLFormElement;
        if (form) {
          form.submit();
        }
      },
    });

    this.submitBtn.render();
  }

  remove() {
    this.submitBtn.remove();
    this.self.remove();
  }
}
