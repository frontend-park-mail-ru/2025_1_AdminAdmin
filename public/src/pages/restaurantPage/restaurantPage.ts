import { RestaurantHeader } from '../../components/restaurantHeader/restaurantHeader';
import { AppRestaurantRequests } from '../../modules/ajax';
import template from './restaurantPage.hbs';

interface Rating {
  score: string;
}

interface RestaurantProps {
  id: string;
  name: string;
  description: string;
  type: string;
  rating: Rating;
  background: string;
  icon: string;
}

/**
 * Класс, представляющий страницу конкретного ресторана.
 */
export default class RestaurantPage {
  private parent: HTMLElement;
  private props: RestaurantProps = {
    id: '',
    name: '',
    description: '',
    type: '',
    rating: {
      score: '',
    },
    background: '',
    icon: '',
  };

  /**
   * Создает экземпляр страницы ресторана.
   * @param parent - Родительский элемент, в который будет рендериться страница ресторана
   * @param id - Идентификатор ресторана, который нужно отобразить
   */
  constructor(parent: HTMLElement, id: string) {
    this.parent = parent;
    this.props.id = id;
  }

  /**
   * Ссылка на объект
   * @returns Ссылка на объект
   */
  get self(): HTMLElement | null {
    return document.querySelector('.restaurantPage__body');
  }

  /**
   * Рендерит информацию о ресторане.
   * Запрашивает данные ресторана по ID и отображает их на странице.
   */
  async render(): Promise<void> {
    try {
      // Получаем список всех ресторанов
      const restaurants: Array<RestaurantProps> = await AppRestaurantRequests.GetAll();
      if (!Array.isArray(restaurants)) {
        throw new Error('RestaurantPage: Нет ресторанов!');
      }

      // Ищем ресторан по ID. Получаем его данные
      const restaurantDetails = restaurants.find((r) => r.id === this.props.id);
      if (!restaurantDetails) {
        throw new Error(`RestaurantPage: Ресторан с ID ${this.props.id} не найден!`);
      }

      this.props = { ...this.props, ...restaurantDetails };

      // Генерируем HTML
      this.parent.innerHTML = template();

      if (this.self) {
        const restaurant__header = new RestaurantHeader(this.self, this.props);
        restaurant__header.render();
      }
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
