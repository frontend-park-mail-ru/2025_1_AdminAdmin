import template from './productsCarousel.hbs';

export interface ICard {
  render(): void;
  remove(): void;
}

export class Carousel<T> {
  private parent: HTMLElement;
  private cardInstances: ICard[] = [];
  private items: T[];
  private readonly cardFactory: (container: HTMLElement, item: T) => ICard;

  constructor(
    parent: HTMLElement,
    items: T[],
    cardFactory: (container: HTMLElement, item: T) => ICard,
  ) {
    this.parent = parent;
    this.items = items;
    this.cardFactory = cardFactory;
  }

  render() {
    const html = template();
    this.parent.insertAdjacentHTML('beforeend', html);

    const cardsContainer: HTMLDivElement = this.parent.querySelector('.carousel__cards');

    this.items.forEach((item) => {
      const card = this.cardFactory(cardsContainer, item);
      card.render();
      this.cardInstances.push(card);
    });

    document.getElementById('carousel-button--next')?.addEventListener('click', this.animateNext);
    document.getElementById('carousel-button--prev')?.addEventListener('click', this.animatePrev);
    cardsContainer.addEventListener('scroll', this.updateButtonsVisibility);

    this.updateButtonsVisibility();
  }

  remove() {
    document
      .getElementById('carousel-button--next')
      ?.removeEventListener('click', this.animateNext);
    document
      .getElementById('carousel-button--prev')
      ?.removeEventListener('click', this.animatePrev);

    const cardsContainer = this.parent.querySelector('.carousel__cards');
    cardsContainer?.removeEventListener('scroll', this.updateButtonsVisibility);

    this.cardInstances.forEach((card) => card.remove());
    this.cardInstances = [];
    this.items = [];
  }

  private animateNext = () => {
    const container = this.parent.querySelector('.carousel__cards') as HTMLElement;
    const card = container?.querySelector(':scope > *') as HTMLElement;
    if (!card) return;

    container.scrollBy({ left: card.offsetWidth + 5, behavior: 'smooth' });
  };

  private animatePrev = () => {
    const container = this.parent.querySelector('.carousel__cards') as HTMLElement;
    const card = container?.querySelector(':scope > *') as HTMLElement;
    if (!card) return;

    container.scrollBy({ left: -(card.offsetWidth + 5), behavior: 'smooth' });
  };

  private updateButtonsVisibility = () => {
    const container = this.parent.querySelector('.carousel__cards') as HTMLElement;
    const prevButton = document.getElementById('carousel-button--prev') as HTMLElement;
    const nextButton = document.getElementById('carousel-button--next') as HTMLElement;

    const scrollLeft = Math.ceil(container.scrollLeft);
    const scrollRight = scrollLeft + container.clientWidth;
    const scrollMax = Math.floor(container.scrollWidth);

    prevButton.style.opacity = scrollLeft <= 50 ? '0' : '1';
    prevButton.style.pointerEvents = scrollLeft <= 50 ? 'none' : 'auto';

    nextButton.style.opacity = scrollRight >= scrollMax - 50 ? '0' : '1';
    nextButton.style.pointerEvents = scrollRight >= scrollMax - 50 ? 'none' : 'auto';
  };
}
