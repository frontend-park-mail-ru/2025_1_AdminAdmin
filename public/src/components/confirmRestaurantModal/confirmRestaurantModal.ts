import template from './confirmRestaurantModal.hbs';
import { Button } from '@components/button/button';

export class ConfirmRestaurantModal {
  private readonly restaurant: string;
  private readonly previousRestaurant: string;
  private submitBtn: Button;
  private cancelBtn: Button;
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

  render() {
    const html = template({
      restaurant: this.restaurant,
      previousRestaurant: this.previousRestaurant,
    });

    document.body.insertAdjacentHTML('beforeend', html);
    document.body.style.overflow = 'hidden';

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
      onSubmit: this.onSubmit,
    });
    this.submitBtn.render();
  }

  remove() {
    this.submitBtn.remove();
    this.cancelBtn.remove();
    this.self?.remove();
    document.body.style.overflow = '';
  }
}
