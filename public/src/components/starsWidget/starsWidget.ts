import template from './starsWidget.hbs';

export class StarsWidget {
  private stars: NodeListOf<Element>;
  private readonly parent: HTMLElement;
  private currentRating: number;
  private readonly areReviewsModalStars: boolean;
  private isGlowing = false;
  private readonly onSend: (value: number) => void;
  private readonly editable: boolean;
  private dark: boolean;

  constructor(
    parent: HTMLElement,
    rating: number,
    onSend: (value: number) => void,
    editable = true,
    dark = false,
  ) {
    this.parent = parent;
    this.currentRating = rating;
    this.areReviewsModalStars = rating === 0;
    this.onSend = onSend;
    this.editable = editable;
    this.dark = dark;
  }

  get self(): HTMLDivElement {
    return this.parent.querySelector('.rating_stars');
  }

  render() {
    const html = template({ stars: [1, 2, 3, 4, 5], editable: this.editable, dark: this.dark });
    this.parent.insertAdjacentHTML('beforeend', html);
    this.stars = this.parent.querySelectorAll('.rating_star');

    this.highlightStars(this.currentRating);

    if (!this.editable && !this.dark) {
      this.self.style.cursor = 'not-allowed';
      return;
    } else if (this.dark) {
      return;
    }

    this.stars.forEach((star) => {
      star.addEventListener('mouseenter', this.handleMouseEnter);
      star.addEventListener('mouseleave', this.handleMouseLeave);
      star.addEventListener('click', this.handleClick);
    });
  }

  setRating(rating: number) {
    this.currentRating = rating;
    this.highlightStars(this.currentRating);
  }

  private handleMouseEnter = (e: Event) => {
    if (this.isGlowing) return;
    const star = e.currentTarget as HTMLElement;
    const value = Number(star.dataset.value);
    this.highlightStars(value, 'hover');
  };

  private handleMouseLeave = () => {
    if (this.isGlowing) return;
    this.highlightStars(this.currentRating, 'selected');
  };

  private handleClick = async (e: Event) => {
    const star = e.currentTarget as HTMLElement;
    const value = Number(star.dataset.value);

    this.sendRating(value);

    this.highlightStars(value, 'glowing');
    this.isGlowing = true;

    if (this.areReviewsModalStars) {
      this.currentRating = value;
    }
    setTimeout(() => {
      this.isGlowing = false;
      this.highlightStars(this.currentRating, 'selected');
    }, 1500);
  };

  private highlightStars(value: number, className = 'selected') {
    const fullStars = Math.floor(value);
    const partial = value - fullStars;

    this.stars.forEach((star: HTMLElement, i) => {
      star.classList.remove('selected', 'hover', 'partial', 'glowing');
      star.style.removeProperty('--percent');

      if (i < fullStars) {
        star.classList.add(className);
      } else if (i === fullStars && partial > 0) {
        star.classList.add('partial');
        star.style.setProperty('--percent', `${Math.round(partial * 100)}%`);
      }
    });
  }

  private sendRating(value: number) {
    this.onSend(value);
  }

  remove() {
    if (!this.editable) return;
    this.stars.forEach((star) => {
      star.removeEventListener('mouseenter', this.handleMouseEnter);
      star.removeEventListener('mouseleave', this.handleMouseLeave);
      star.removeEventListener('click', this.handleClick);
    });
  }
}
