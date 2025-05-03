import template from './morePlaceholder.hbs';
import { router } from '@modules/routing';

export class MorePlaceHolder {
  private parent: HTMLElement;
  private readonly restaurntId: string;

  constructor(parent: HTMLElement, restaurantId: string) {
    this.parent = parent;
    this.restaurntId = restaurantId;
  }

  get self() {
    return this.parent.querySelector('.more-placeholder');
  }

  render() {
    this.parent.insertAdjacentHTML('beforeend', template());
    this.self.addEventListener('click', this.handleClick);
  }

  private handleClick = () => {
    router.goToPage('restaurantPage', this.restaurntId);
  };

  remove() {
    this.self.removeEventListener('click', this.handleClick);
    this.self.remove();
  }
}
