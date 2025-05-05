import template from './reviewsModal.hbs';
import { Button } from '@components/button/button';
import { Review } from '@myTypes/restaurantTypes';
import { AppRestaurantRequests } from '@modules/ajax';
import { RestaurantReview } from '@components/restaurantReviews/restaurantReview/restaurantReview';
import { FormInput } from '@components/formInput/formInput';
import { StarsWidget } from '@components/starsWidget/starsWidget';
import { router } from '@modules/routing';
import { modalController } from '@modules/modalController';
const { userStore } = await import('@store/userStore');

const MAX_LENGTH = 300;

export class ReviewsModal {
  private readonly restaurant_id: string;
  private readonly rating: number;
  private reviews: Review[];
  private previousReview: RestaurantReview;
  private previousReviewId: string | undefined;
  private reviewsComponents: RestaurantReview[];
  private submitBtn: Button;
  private isSubmitting = false;
  private reviewInput: FormInput;
  private starsWidget: StarsWidget;
  private reviewRating: number;
  private readonly onSubmit: (newReview: Review) => void;

  constructor(restaurant_id: string, rating: number, onSubmit: (newReview: Review) => void) {
    this.restaurant_id = restaurant_id;
    this.rating = rating;
    this.reviewsComponents = [];
    this.onSubmit = onSubmit;
  }

  get self(): HTMLElement {
    return document.querySelector('.reviews_modal');
  }

  get closeElem(): HTMLElement | null {
    return document.querySelector('.reviews_modal__close_icon');
  }

  get input(): HTMLTextAreaElement | null {
    return this.self?.querySelector('.reviews_modal__new_review__textarea');
  }

  beforeInputHandler = (e: InputEvent) => {
    if (this.shouldIgnoreInput(e)) return;

    const newChar = (e.data ?? '').toString();
    const input = this.input;
    if (!input || !newChar) return;

    const currentValue = input.value.trim();
    const newValue = currentValue + newChar;

    if (this.exceedsMaxLength(newValue)) {
      e.preventDefault();
    }
  };

  private shouldIgnoreInput(e: InputEvent): boolean {
    return e.inputType.startsWith('delete');
  }

  private exceedsMaxLength(value: string): boolean {
    return value.length > MAX_LENGTH;
  }
  async checkIfCanReview(): Promise<boolean> {
    let canReview = false;
    const isAuth = userStore.isAuth();

    if (isAuth) {
      try {
        this.previousReviewId = await AppRestaurantRequests.CanLeaveReview(this.restaurant_id);
        if (typeof this.previousReviewId === 'string') {
          canReview = false;
        } else {
          canReview = true;
        }
      } catch {
        canReview = false;
      }
    }

    return canReview;
  }

  async renderReviews() {
    this.reviews = await AppRestaurantRequests.GetReviews(this.restaurant_id);

    if (!Array.isArray(this.reviews) || this.reviews.length === 0) {
      const noReviews = document.getElementById('no-reviews');
      noReviews.style.display = 'block';
    }

    const reviewsContainer: HTMLDivElement = this.self.querySelector(
      '.reviews_modal__reviews_container',
    );
    for (const review of this.reviews) {
      let reviewComponent: RestaurantReview;
      if (review.id === this.previousReviewId) {
        reviewComponent = new RestaurantReview(reviewsContainer, { ...review, isActive: true });
        this.previousReview = reviewComponent;
      } else {
        reviewComponent = new RestaurantReview(reviewsContainer, { ...review, isActive: false });
      }
      reviewComponent.render();
      this.reviewsComponents.push(reviewComponent);
    }
  }

  createLoginButton() {
    const buttonContainer: HTMLElement = this.self.querySelector('.reviews_modal__content');

    this.submitBtn = new Button(buttonContainer, {
      id: 'reviews_modal__submit',
      style: 'button_active',
      text: 'Авторизоваться',
      onSubmit: async () => {
        router.goToPage('loginPage');
        modalController.closeModal();
      },
    });

    this.submitBtn.render();
  }

  createReviewSubmitButton() {
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
          const newReview = await AppRestaurantRequests.SendReview(this.restaurant_id, {
            review_text: this.input.value,
            rating: this.reviewRating,
          });

          this.handleNewReview(newReview);
        } finally {
          this.isSubmitting = false;
        }
      },
    });

    this.submitBtn.render();
  }

  handleNewReview(newReview: Review) {
    const reviewsContainer: HTMLDivElement = this.self.querySelector(
      '.reviews_modal__reviews_container',
    );
    const reviewComponent = new RestaurantReview(reviewsContainer, {
      ...newReview,
      isActive: true,
    });
    reviewComponent.render('afterbegin');
    this.reviewsComponents.push(reviewComponent);

    reviewComponent.self.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const newReviewContainer: HTMLDivElement = this.self.querySelector(
      '.reviews_modal__new_review',
    );

    newReviewContainer.style.animation = 'moveDown 0.5s linear forwards';

    setTimeout(() => {
      newReviewContainer.classList.add('hidden');
    }, 500);

    const noReviews = document.getElementById('no-reviews');
    noReviews.style.display = 'none';

    this.onSubmit(newReview);
  }

  async render() {
    const canReview = await this.checkIfCanReview();

    const html = template({ canReview });
    document.body.insertAdjacentHTML('beforeend', html);
    document.body.style.overflow = 'hidden';

    await this.renderReviews();

    this.previousReview?.self.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (!canReview) return;

    if (!userStore.isAuth()) {
      this.createLoginButton();
      return;
    }

    this.createReviewSubmitButton();

    const starsContainer: HTMLElement = document.getElementById('stars');

    this.starsWidget = new StarsWidget(starsContainer, 0, (rating) => {
      this.reviewRating = rating;
      this.submitBtn.enable();
    });

    this.starsWidget.render();
    this.input.addEventListener('beforeinput', this.beforeInputHandler);
  }

  remove() {
    for (const reviewComponent of this.reviewsComponents) {
      reviewComponent.remove();
    }

    this.reviewsComponents = [];

    if (this.input) {
      this.input.removeEventListener('beforeinput', this.beforeInputHandler);
    }
    this.reviewInput?.remove();
    this.starsWidget?.remove();
    this.submitBtn?.remove();
    this.self?.remove();
    document.body.style.overflow = '';
  }
}
