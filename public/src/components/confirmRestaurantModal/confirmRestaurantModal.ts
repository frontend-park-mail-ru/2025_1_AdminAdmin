import template from './confirmRestaurantModal.hbs';
import { Button } from 'doordashers-ui-kit';

export class ConfirmRestaurantModal {
  private readonly restaurant: string;
  private readonly previousRestaurant: string;
  private submitBtn: Button;
  private cancelBtn: Button;
  private isSubmitting = false;
  onSubmit: () => void;
  onCancel: () => void;

  constructor(
    restaurant: string,
    previousRestaurant: string,
    onSubmit: () => void,
    onCancel: () => void,
  ) {
    this.restaurant = restaurant;
    this.previousRestaurant = previousRestaurant;
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
  }

  get self(): HTMLElement {
    return document.querySelector('.confirm_restaurant_modal');
  }

  get closeElem(): HTMLElement | null {
    return document.querySelector('.confirm_restaurant_modal__close_icon');
  }

  render() {
    const html = template({
      restaurant: this.restaurant,
      previousRestaurant: this.previousRestaurant,
    });

    document.body.insertAdjacentHTML('beforeend', html);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      this.self?.classList.add('enter');
    });

    const buttonContainer: HTMLElement = this.self.querySelector('.form__line');

    this.cancelBtn = new Button(buttonContainer, {
      id: 'confirm_restaurant_modal__cancel',
      style: 'form__button',
      text: 'Отменить',
      onSubmit: this.onCancel,
    });
    this.cancelBtn.render();

    this.submitBtn = new Button(buttonContainer, {
      id: 'confirm_restaurant_modal__submit',
      style: 'dark form__button',
      text: 'Продолжить',
      onSubmit: async () => {
        if (this.isSubmitting) return;
        this.isSubmitting = true;
        this.submitBtn.disable?.();

        try {
          this.onSubmit();
        } finally {
          this.isSubmitting = false;
        }
      },
    });

    this.submitBtn.render();
  }

  remove() {
    this.self.classList.remove('enter');
    this.self.classList.add('leave');

    this.submitBtn.remove();
    this.cancelBtn.remove();

    setTimeout(() => {
      this.self?.remove();
    }, 300);
    document.body.style.overflow = '';
  }
}
