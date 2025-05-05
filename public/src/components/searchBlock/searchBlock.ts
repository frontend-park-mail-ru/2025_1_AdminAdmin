import { SearchRestaurant } from '@myTypes/restaurantTypes';
import template from './searchBlock.hbs';
import { RestaurantCard } from '@components/restaurantCard/restaurantCard';
import { ProductCard } from '@components/productCard/productCard';
import { MorePlaceHolder } from '@components/productCard/morePlaceholder/morePlaceHolder';

export class SearchBlock {
  private readonly parent: HTMLElement;
  private readonly restaurant: SearchRestaurant;
  private restaurantCard: RestaurantCard;
  private productCards: ProductCard[] = [];
  private moreButton: MorePlaceHolder;

  constructor(parent: HTMLElement, restaurant: SearchRestaurant) {
    this.parent = parent;
    this.restaurant = restaurant;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(`search-block-${this.restaurant.id}`);
    if (!element) {
      throw new Error(`Search block не найден`);
    }
    return element as HTMLElement;
  }

  render(pushDirection: InsertPosition = 'beforeend') {
    const html = template({ id: this.restaurant.id });
    this.parent.insertAdjacentHTML(pushDirection, html);

    const restaurantContainer = document.getElementById(
      `search-block__restaurant-${this.restaurant.id}`,
    );
    this.restaurantCard = new RestaurantCard(restaurantContainer, this.restaurant, true);
    this.restaurantCard.render();

    const productContainer = document.getElementById(
      `search-block__products-${this.restaurant.id}`,
    );
    let columnNumber = 1;

    for (const product of this.restaurant.products) {
      const productCard = new ProductCard(
        productContainer,
        this.restaurant.id,
        this.restaurant.name,
        product,
      );
      productCard.render();
      this.productCards.push(productCard);

      columnNumber++;
    }

    if (columnNumber === 6) {
      this.moreButton = new MorePlaceHolder(productContainer, this.restaurant.id);
      this.moreButton.render();
      return;
    }
  }

  remove() {
    this.restaurantCard.remove();
    this.moreButton?.remove();
    this.productCards.forEach((productCard) => productCard.remove());
    this.productCards = [];

    this.self.remove();
  }
}
