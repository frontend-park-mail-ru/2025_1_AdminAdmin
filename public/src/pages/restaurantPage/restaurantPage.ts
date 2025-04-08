import {
  RestaurantHeader,
  RestaurantHeaderProps,
} from '@components/restaurantHeader/restaurantHeader';
import { RestaurantReviews } from '@components/restaurantReviews/restaurantReviews';
import { Categories } from '@components/categories/categories';
import { ProductCard } from '@components/productCard/productCard';
import Cart from '@components/cart/cart';
import { AppRestaurantRequests } from '@modules/ajax';

import template from './restaurantPage.hbs';
import { RestaurantReviewProps } from '@components/restaurantReviews/restaurantReview/restaurantReview';
import { RestaurantDetailProps } from '@components/restaurantReviews/restaurantDetail/restaurantDetail';
import type { RestaurantResponse, WorkingMode, Category, Product } from '@myTypes/restaurantTypes';

/**
 * Класс, представляющий страницу конкретного ресторана.
 */
export default class RestaurantPage {
  private parent: HTMLElement;
  private readonly id: string;
  private props: RestaurantResponse;
  private cartComponent: Cart;
  private categoriesComponent: Categories;
  private productCards: ProductCard[] = [];

  /**
   * Создает экземпляр страницы ресторана.
   * @param parent - Родительский элемент, в который будет рендериться страница ресторана
   * @param id - Идентификатор ресторана, который нужно отобразить
   */
  constructor(parent: HTMLElement, id: string) {
    if (!parent) {
      throw new Error('RestaurantPage: no parent!');
    }
    this.parent = parent;
    this.id = id;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.restaurant-page__body');
    if (!element) {
      throw new Error(`Error: can't find restaurant-page`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Рендерит информацию о ресторане.
   * Запрашивает данные ресторана по ID и отображает их на странице.
   */
  async render(): Promise<void> {
    try {
      this.props = await AppRestaurantRequests.Get(this.id);

      // Генерируем HTML
      this.parent.innerHTML = template();

      // Заполняем
      // Рендерим хедер (шапка + название)
      const restaurantHeaderWrapper = this.self.querySelector(
        '.restaurant-header__wrapper',
      ) as HTMLElement;

      const restaurantHeaderComponent = new RestaurantHeader(restaurantHeaderWrapper, {
        name: this.props.name,
        banner_url: this.props.banner_url,
        rating: this.props.rating,
        rating_count: this.props.rating_count,
        tags: this.props.tags,
      });

      restaurantHeaderComponent.render();

      const restaurantReviewsWrapper: HTMLElement = this.self.querySelector(
        '.restaurant-reviews__wrapper',
      );

      const restaurantReviewsComponent = new RestaurantReviews(restaurantReviewsWrapper, {
        rating: this.props.rating,
        rating_count: this.props.rating_count,
        address: this.props.address,
        working_mode: this.props.working_mode,
      });
      restaurantReviewsComponent.render();

      const categoriesWrapper: HTMLElement = this.self.querySelector(
        '.product-categories__wrapper',
      );

      const productCardsBody = this.self.querySelector('.product-cards__body') as HTMLElement;

      this.categoriesComponent = new Categories(categoriesWrapper, productCardsBody);

      this.categoriesComponent.render();

      this.props.categories.forEach((category) => {
        this.categoriesComponent.addCategory(category.name);
        category.products.forEach((product) => {
          const productCardComponent = new ProductCard(
            productCardsBody,
            this.props.id,
            this.props.name,
            product,
          );
          productCardComponent.render();
          this.productCards.push(productCardComponent);
        });
      });

      const cartWrapper: HTMLElement = this.self.querySelector('.cart__wrapper');
      this.cartComponent = new Cart(cartWrapper, this.props.id);
      this.cartComponent.render();
      this.makeFixed(cartWrapper, categoriesWrapper);
    } catch (error) {
      console.error('Error rendering restaurant page:', error);
    }
  }

  makeFixed(cartWrapper: HTMLElement, categoriesWrapper: HTMLElement): void {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;

      if (scrollTop > cartWrapper.offsetTop) {
        cartWrapper.classList.add('fixed');
      } else {
        cartWrapper.classList.remove('fixed');
      }

      if (scrollTop > categoriesWrapper.offsetTop) {
        categoriesWrapper.classList.add('fixed');
      } else {
        categoriesWrapper.classList.remove('fixed');
      }
    });
  }

  /**
   * Удаляет страницу ресторана и очищает содержимое родительского элемента.
   */
  remove(): void {
    this.productCards.forEach((productCard) => productCard.remove());
    this.productCards = [];

    this.categoriesComponent?.remove();
    this.cartComponent?.remove();
    this.parent.innerHTML = '';
  }
}
