import {
  RatingProps,
  RestaurantHeader,
  RestaurantHeaderProps,
} from '../../components/restaurantHeader/restaurantHeader';
import {
  RestaurantReviews,
  RestaurantReviewsProps,
} from '../../components/restaurantReviews/restaurantReviews';
import { Categories, CategoriesProps } from '../../components/categories/categories';
import { ProductCard, ProductCardProps } from '../../components/productCard/productCard';
import { AppRestaurantRequests } from '../../modules/ajax';

import template from './restaurantPage.hbs';
import { RestaurantReviewProps } from '../../components/restaurantReviews/restaurantReview/restaurantReview';
import { RestaurantDetailProps } from '../../components/restaurantReviews/restaurantDetail/restaurantDetail';
import { CategoryProps } from '../../components/category/category';

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
  rating: {
    score: string;
  };
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
    this.parent = parent;
    this.props = {
      id: id,
      // Прибиваю временные значения
      restaurantHeaderProps: {
        name: '', // Обязательное поле
      } as RestaurantHeaderProps, // Пустой объект для хедера (заполню потом)
      // Для остальных тоже лучше пустые сделать а потом заполнять, но пока так
      restaurantReviewsProps: {
        rating: {
          score: '5',
          amount: '100',
        } as RatingProps,
        reviewsList: [
          {
            id: '1',
            text: '1-ый отзыв',
            rating: 1,
            author: 'Автор1',
            date: '01.01.25',
          } as RestaurantReviewProps,
          {
            id: '2',
            text: '2-ой отзыв',
            rating: 2,
            author: 'Автор2',
            date: '02.02.25',
          } as RestaurantReviewProps,
          {
            id: '3',
            text: '3-ий отзыв (не виден)',
            rating: 3,
            author: 'Автор3',
            date: '03.03.25',
          } as RestaurantReviewProps,
        ],
        hours: {
          status: true, // Статус ресторана (1 - открыто, 0 - закрыто)
          open: '10:00', // Время открытия
          close: '18:00', // Время закрытия
        },
        address: {
          city: 'Москва',
          street: 'Дмитровское ш., 13А, 127434',
        },
      } as RestaurantReviewsProps,
      productsProps: [
        {
          id: '1',
          name: 'Воппер',
          isActive: true,
          price: 529.99,
          amount: 2,
        } as ProductCardProps,
        {
          id: '2',
          name: 'Воппер',
          price: 529.99,
        } as ProductCardProps,
        {
          id: '3',
          name: 'Воппер',
          price: 529.99,
        } as ProductCardProps,
        {
          id: '4',
          name: 'Воппер',
          isActive: true,
          price: 529.99,
          amount: 2,
        } as ProductCardProps,
        {
          id: '5',
          name: 'Воппер',
          price: 529.99,
        } as ProductCardProps,
        {
          id: '6',
          name: 'Воппер',
          price: 529.99,
        } as ProductCardProps,
      ],
      productCategoriesProps: {
        activeCategoryId: '1',
        categoriesList: [
          {
            id: '1',
            name: 'Популярное',
          } as CategoryProps,
          {
            id: '2',
            name: 'Новинки',
          } as CategoryProps,
          {
            id: '3',
            name: 'Кинг комбо',
          } as CategoryProps,
          {
            id: '4',
            name: 'Боксы',
          } as CategoryProps,
        ],
      } as CategoriesProps,
    } as RestaurantPageProps;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.restaurantPage__body');
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
    if (!template) {
      throw new Error('Error: restaurant page template not found');
    }
    try {
      // Получаем список всех ресторанов
      const restaurants: Array<RestaurantRequestProps> = await AppRestaurantRequests.GetAll();
      if (!Array.isArray(restaurants)) {
        throw new Error('RestaurantPage: Нет ресторанов!');
      }
      // Ищем ресторан по ID. Получаем его данные
      const restaurantDetails = restaurants.find((r) => r.id === this.props.id);
      if (!restaurantDetails) {
        throw new Error(`RestaurantPage: Ресторан с ID ${this.props.id} не найден!`);
      }
      this.props.restaurantHeaderProps = {
        name: restaurantDetails.name,
        description: restaurantDetails.description,
        type: restaurantDetails.type,
        rating: {
          score: restaurantDetails.rating.score,
        },
        background: restaurantDetails.background,
        icon: restaurantDetails.icon,
      };
      // Генерируем HTML
      this.parent.innerHTML = template();
      // Заполняем
      const restaurantHeaderComponent = new RestaurantHeader(
        this.self,
        this.props.restaurantHeaderProps,
      );
      restaurantHeaderComponent.render();
      const restaurantReviewsComponent = new RestaurantReviews(
        this.self,
        this.props.restaurantReviewsProps,
      );
      restaurantReviewsComponent.render();
      const restaurantProductsInsert = `
      <div class="restaurant__products">
      </div>
      `;
      this.self.insertAdjacentHTML('beforeend', restaurantProductsInsert);
      const restaurantProducts = this.self.querySelector('.restaurant__products') as HTMLElement;
      const categoriesComponent = new Categories(
        restaurantProducts,
        this.props.productCategoriesProps,
      );
      categoriesComponent.render();
      const productCardsInsert = `
      <div class="product__cards">
        <span class="product__cards__header">Категория ${this.props.productCategoriesProps.activeCategoryId}</span>
        <div class="product__cards__body">
        </div>
      </div>
      `;
      restaurantProducts.insertAdjacentHTML('beforeend', productCardsInsert);
      const productCardsBody = this.self.querySelector('.product__cards__body') as HTMLElement;
      this.props.productsProps.forEach((productCardProps) => {
        const productCardComponent = new ProductCard(productCardsBody, productCardProps);
        productCardComponent.render();
      });
    } catch (error) {
      console.error('Error rendering restaurant page:', error);
    }
  }

  /**
   * Удаляет страницу ресторана и очищает содержимое родительского элемента.
   */
  remove(): void {
    this.parent.innerHTML = '';
  }
}
