import template from './reviewsModal.hbs';
import { Button } from '@components/button/button';
import { Review } from '@myTypes/restaurantTypes';
import { AppRestaurantRequests } from '@modules/ajax';
import { RestaurantReview } from '@components/restaurantReviews/restaurantReview/restaurantReview';
import { FormInput } from '@components/formInput/formInput';

export class ReviewsModal {
  private readonly restaurant_id: string;
  private reviews: Review[];
  private reviewsComponents: RestaurantReview[];
  private submitBtn: Button;
  private isSubmitting = false;
  private reviewInput: FormInput;

  constructor(restaurant_id: string) {
    this.restaurant_id = restaurant_id;
    this.reviewsComponents = [];
  }

  get self(): HTMLElement {
    return document.querySelector('.reviews_modal');
  }

  get closeElem(): HTMLElement | null {
    return document.querySelector('.reviews_modal__close_icon');
  }

  async render() {
    const html = template();
    document.body.insertAdjacentHTML('beforeend', html);
    document.body.style.overflow = 'hidden';

    this.reviews = await AppRestaurantRequests.GetReviews(this.restaurant_id);

    const reviewsContainer: HTMLDivElement = this.self.querySelector(
      '.reviews_modal__reviews_container',
    );
    for (const review of this.reviews) {
      const reviewComponent = new RestaurantReview(reviewsContainer, review);
      reviewComponent.render();
      this.reviewsComponents.push(reviewComponent);
    }

    const buttonContainer: HTMLElement = this.self.querySelector(
      '.reviews_modal__new_review__bottom',
    );

    this.submitBtn = new Button(buttonContainer, {
      id: 'reviews_modal__submit',
      style: 'dark big',
      text: 'Отправить',
      disabled: true,
      onSubmit: async () => {
        if (this.isSubmitting) return;
        this.isSubmitting = true;
        this.submitBtn.disable?.();

        try {
          //this.onSubmit();
        } finally {
          this.isSubmitting = false;
        }
      },
    });

    this.submitBtn.render();
  }

  remove() {
    for (const reviewComponent of this.reviewsComponents) {
      reviewComponent.remove();
    }

    this.reviewsComponents = [];

    this.reviewInput?.remove();
    this.submitBtn.remove();
    this.self?.remove();
    document.body.style.overflow = '';
  }
}
