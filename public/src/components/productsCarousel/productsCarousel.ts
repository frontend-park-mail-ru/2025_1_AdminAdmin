import template from './productsCarousel.hbs';

export interface ICard {
  render(): void;
  remove(): void;
}

export class Carousel<T> {
  private parent: HTMLElement;
  private cardInstances: ICard[] = [];
  private items: T[];
  private cardsContainer: HTMLElement;
  private nextButton: HTMLElement;
  private prevButton: HTMLElement;
  private readonly cardFactory: (container: HTMLElement, item: T) => ICard;
  private readonly id: string;

  constructor(
    id: string,
    parent: HTMLElement,
    items: T[],
    cardFactory: (container: HTMLElement, item: T) => ICard,
  ) {
    this.id = id;
    this.parent = parent;
    this.items = items;
    this.cardFactory = cardFactory;
  }

  render() {
    const html = template({ id: this.id });
    this.parent.insertAdjacentHTML('beforeend', html);

    const carouselElement = this.parent.querySelector(`#carousel-${this.id}`);
    const cardsContainer = carouselElement.querySelector('.carousel__cards') as HTMLElement;
    const nextButton = carouselElement.querySelector('.carousel__button--next') as HTMLElement;
    const prevButton = carouselElement.querySelector('.carousel__button--prev') as HTMLElement;

    this.items.forEach((item) => {
      const card = this.cardFactory(cardsContainer, item);
      card.render();
      this.cardInstances.push(card);
    });

    nextButton?.addEventListener('click', this.animateNext);
    prevButton?.addEventListener('click', this.animatePrev);
    cardsContainer.addEventListener('scroll', this.updateButtonsVisibility);

    this.cardsContainer = cardsContainer;
    this.nextButton = nextButton;
    this.prevButton = prevButton;

    this.updateButtonsVisibility();
  }

  remove() {
    this.nextButton?.removeEventListener('click', this.animateNext);
    this.prevButton?.removeEventListener('click', this.animatePrev);
    this.cardsContainer?.removeEventListener('scroll', this.updateButtonsVisibility);

    this.cardInstances.forEach((card) => card.remove());
    this.cardInstances = [];
    this.items = [];
  }

  private animateNext = () => {
    const container = this.cardsContainer;
    const card = container?.querySelector(':scope > *') as HTMLElement;
    if (!card) return;

    container.scrollBy({ left: card.offsetWidth + 5, behavior: 'smooth' });
  };

  private animatePrev = () => {
    const container = this.cardsContainer;
    const card = container?.querySelector(':scope > *') as HTMLElement;
    if (!card) return;

    container.scrollBy({ left: -(card.offsetWidth + 5), behavior: 'smooth' });
  };

  private updateButtonsVisibility = () => {
    const container = this.cardsContainer;

    const scrollLeft = Math.ceil(container.scrollLeft);
    const scrollRight = scrollLeft + container.clientWidth;
    const scrollMax = Math.floor(container.scrollWidth);

    this.prevButton.style.opacity = scrollLeft <= 50 ? '0' : '1';
    this.prevButton.style.pointerEvents = scrollLeft <= 50 ? 'none' : 'auto';

    this.nextButton.style.opacity = scrollRight >= scrollMax - 50 ? '0' : '1';
    this.nextButton.style.pointerEvents = scrollRight >= scrollMax - 50 ? 'none' : 'auto';
  };
}
