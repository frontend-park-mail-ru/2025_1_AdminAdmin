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
  rating: {
    score: number;
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
    if (!parent) {
      throw new Error('RestaurantPage: no parent!');
    }
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
          score: 5,
          amount: 100,
        } as RatingProps,
        reviewsList: [
          {
            id: 'review1',
            text: '1-ый отзыв',
            rating: 1,
            author: 'Автор1',
            date: '01.01.25',
          } as RestaurantReviewProps,
          {
            id: 'review2',
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
          id: 'product1',
          name: 'Воппер',
          inCart: true,
          price: 529.99,
          amount: 2,
        } as ProductCardProps,
        {
          id: 'product2',
          name: 'Воппер',
          price: 529.99,
        } as ProductCardProps,
        {
          id: 'product3',
          name: 'Воппер',
          price: 529.99,
        } as ProductCardProps,
        {
          id: 'product4',
          name: 'Воппер',
          inCart: true,
          price: 529.99,
          amount: 2,
        } as ProductCardProps,
        {
          id: 'product5',
          name: 'Воппер',
          price: 529.99,
        } as ProductCardProps,
        {
          id: 'product6',
          name: 'Воппер',
          price: 529.99,
        } as ProductCardProps,
      ],
      productCategoriesProps: {
        onChange: this.handleCategory.bind(this),
        categoriesList: [
          {
            id: 'category1',
            name: 'Популярное',
          } as CategoryProps,
          {
            id: 'category2',
            name: 'Новинки',
          } as CategoryProps,
          {
            id: 'category3',
            name: 'Кинг комбо',
          } as CategoryProps,
          {
            id: 'category4',
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
      // Рендерим хедер (шапка + название)
      const restaurantHeaderWrapper = this.self.querySelector(
        '.restaurant-header__wrapper',
      ) as HTMLElement;
      const restaurantHeaderComponent = new RestaurantHeader(
        restaurantHeaderWrapper,
        this.props.restaurantHeaderProps,
      );
      restaurantHeaderComponent.render();
      // Рендерим блок отзывов (общая оценка + отзывы + адрес и время работы)
      const restaurantReviewsWrapper = this.self.querySelector(
        '.restaurant-reviews__wrapper',
      ) as HTMLElement;
      const restaurantReviewsComponent = new RestaurantReviews(
        restaurantReviewsWrapper,
        this.props.restaurantReviewsProps,
      );
      restaurantReviewsComponent.render();
      // Рендерим блок категорий
      const categoriesWrapper = this.self.querySelector(
        '.product-categories__wrapper',
      ) as HTMLElement;
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
      );
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
