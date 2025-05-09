import { ProductCard } from '@components/productCard/productCard';
import { Product } from '@myTypes/restaurantTypes';
import template from './productsCarousel.hbs';
import { cartStore } from '@store/cartStore';

export class ProductsCarousel {
  parent: HTMLElement;
  productCards: ProductCard[];
  products: Product[];

  constructor(parent: HTMLElement, products: Product[]) {
    this.parent = parent;
    this.products = products;
    this.productCards = [];
  }

  render() {
    const html = template();
    this.parent.insertAdjacentHTML('beforeend', html);

    const cardsContainer: HTMLDivElement = this.parent.querySelector('.carousel__cards');
    this.products.forEach((product) => {
      const productCard = new ProductCard(
        cardsContainer,
        cartStore.getState().restaurant_id,
        cartStore.getState().restaurant_name,
        product,
      );
      productCard.render();
      this.productCards.push(productCard);
    });

    document.getElementById('carousel-button--next').addEventListener('click', this.animateNext);

    document.getElementById('carousel-button--prev').addEventListener('click', this.animatePrev);

    this.updateButtonsVisibility();

    cardsContainer.addEventListener('scroll', this.updateButtonsVisibility);
  }

  animateNext = () => {
    const container = this.parent.querySelector('.carousel__cards') as HTMLElement;
    const card = container.querySelector(':scope > *') as HTMLElement;

    if (!card) return;

    const scrollAmount = card.offsetWidth + 5;

    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  animatePrev = () => {
    const container = this.parent.querySelector('.carousel__cards') as HTMLElement;
    const card = container.querySelector('.product-card') as HTMLElement;

    if (!card) return;

    const scrollAmount = card.offsetWidth + 5;

    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  private updateButtonsVisibility = () => {
    const container = this.parent.querySelector('.carousel__cards') as HTMLElement;
    const prevButton = document.getElementById('carousel-button--prev') as HTMLElement;
    const nextButton = document.getElementById('carousel-button--next') as HTMLElement;

    const scrollLeft = Math.ceil(container.scrollLeft);
    const scrollRight = scrollLeft + container.clientWidth;
    const scrollMax = Math.floor(container.scrollWidth);

    if (scrollLeft <= 50) {
      prevButton.style.opacity = '0';
      prevButton.style.pointerEvents = 'none';
    } else {
      prevButton.style.opacity = '1';
      prevButton.style.pointerEvents = 'auto';
    }

    if (scrollRight >= scrollMax - 50) {
      nextButton.style.opacity = '0';
      nextButton.style.pointerEvents = 'none';
    } else {
      nextButton.style.opacity = '1';
      nextButton.style.pointerEvents = 'auto';
    }
  };

  remove() {
    document.getElementById('carousel-button--next').removeEventListener('click', this.animateNext);
    document.getElementById('carousel-button--prev').removeEventListener('click', this.animatePrev);
    const cardsContainer = this.parent.querySelector('.carousel__cards') as HTMLDivElement;
    cardsContainer.removeEventListener('scroll', this.updateButtonsVisibility);

    this.productCards.forEach((productCard) => {
      productCard.remove();
    });

    this.productCards = [];
    this.products = [];
  }
}
