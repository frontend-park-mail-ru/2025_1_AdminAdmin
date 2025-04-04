import {
  RatingProps,
  RestaurantHeader,
  RestaurantHeaderProps,
} from '@components/restaurantHeader/restaurantHeader';
import {
  RestaurantReviews,
  RestaurantReviewsProps,
} from '@components/restaurantReviews/restaurantReviews';
import { Categories, CategoriesProps } from '@components/categories/categories';
import { ProductCard, ProductCardProps } from '@components/productCard/productCard';
import { AppRestaurantRequests } from '@modules/ajax';

import template from './restaurantPage.hbs';
import { RestaurantReviewProps } from '@components/restaurantReviews/restaurantReview/restaurantReview';
import { RestaurantDetailProps } from '@components/restaurantReviews/restaurantDetail/restaurantDetail';
import { CategoryProps } from '@components/category/category';

interface RestaurantPageProps {
  id: string; // id ресторана
  restaurantHeaderProps: RestaurantHeaderProps; // Данные для хедера ресторана
  restaurantReviewsProps: RestaurantReviewsProps; // Данные отзывов
  productCategoriesProps: CategoriesProps; // Данные категорий
  productsProps: Array<ProductCardProps>; // Данные товаров
}

interface RestaurantRequestProps {
  id: string;
  name: string;
  description: string;
  type: string;
  rating: number;
  background: string;
  icon: string;
}

/**
 * Класс, представляющий страницу конкретного ресторана.
 */
export default class RestaurantPage {
  private parent: HTMLElement;
  private props: RestaurantPageProps;

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
    this.props = {
      id: id,
      restaurantHeaderProps: {
        name: '', // Обязательное поле
      } as RestaurantHeaderProps, // Пустой объект для хедера (заполню потом)

      productCategoriesProps: {
        onChange: this.handleCategory.bind(this),
      } as CategoriesProps,
    } as RestaurantPageProps;
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
      this.props.restaurantHeaderProps = await AppRestaurantRequests.Get(this.props.id);

      // Генерируем HTML
      this.parent.innerHTML = template();

      // Заполняем
      // Рендерим хедер (шапка + название)
      const restaurantHeaderWrapper = this.self.querySelector(
        '.restaurant-header__wrapper',
      ) as HTMLElement;
      const restaurantHeaderComponent = new RestaurantHeader(
        restaurantHeaderWrapper,
        this.props.restaurantHeaderProps,
      );

      restaurantHeaderComponent.render();

      /*      // Рендерим блок отзывов (общая оценка + отзывы + адрес и время работы)
      const restaurantReviewsWrapper : HTMLElement = this.self.querySelector(
        '.restaurant-reviews__wrapper',
      )

      const restaurantReviewsComponent = new RestaurantReviews(
        restaurantReviewsWrapper,
        this.props.restaurantHeaderProps.rating,
      );
      restaurantReviewsComponent.render();*/

      this.props.productsProps = await AppRestaurantRequests.GetProductsByRestaurant(this.props.id);

      /*      // Рендерим блок категорий
      const categoriesWrapper : HTMLElement = this.self.querySelector(
        '.product-categories__wrapper',
      );

      const categoriesComponent = new Categories(
        categoriesWrapper,
        this.props.productCategoriesProps,
      );

      categoriesComponent.render();
      this.handleCategory(
        categoriesComponent
          .getProps()
          .categoriesList.find(
            (catergory) => catergory.id === categoriesComponent.getProps().activeCategoryId,
          )?.name,
      );*/

      // Рендерим карточки
      const productCardsBody = this.self.querySelector('.product-cards__body') as HTMLElement;
      this.props.productsProps.forEach((productCardProps) => {
        const productCardComponent = new ProductCard(productCardsBody, productCardProps);
        productCardComponent.render();
      });
    } catch (error) {
      console.error('Error rendering restaurant page:', error);
    }
  }

  handleCategory(categoryName: string): void {
    this.self.querySelector('.product-cards__header').textContent = `Категория: ${categoryName}`;
  }

  /**
   * Удаляет страницу ресторана и очищает содержимое родительского элемента.
   */
  remove(): void {
    this.parent.innerHTML = '';
  }
}
