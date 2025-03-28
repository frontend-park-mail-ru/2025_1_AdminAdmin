import template from './restaurantDetail.hbs';

// Структура изображения (нужно для структуры детали)
export interface ImageProps {
  // ? - необязательное поле
  src: string; // Путь до изображения        | Если не задано, то detail.png
  alt?: string; // Текст если не загрузилось  | Если не задано, то "подробная информация"
}

// Структура класса детали (нужно для конструктора)
export interface RestaurantDetailProps {
  // ? - необязательное поле
  id: string; // Id для идентификации | Обязательное поле
  image?: ImageProps; // Изображение детали   | Если не задано, то detail.png
  mainText: string; // Основной текст       | Обязательное поле
  addText?: string; // Дополнительный текст | Может быть не задано
}
/**
 * Класс детали ресторана
 */
export class RestaurantDetail {
  protected parent: HTMLElement; // Родитель (где вызывается)
  protected props: RestaurantDetailProps;

  /**
   *Создает экземпляр детали ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться деталь ресторана.
   * @param {Object} props - Словарь данных для определения свойств детали ресторана
   */
  constructor(parent: HTMLElement, props: RestaurantDetailProps) {
    if (!parent) {
      throw new Error('RestaurantDetail: no parent!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      image: {
        // В src записываем путь до картинки если он задан, иначе detail.png
        src: props.image?.src || '/src/assets/detail.png',
        // В alt записываем текст если не подгрузилась картинка или название файла (.../[название файла].[расширение]) если задано правильно, иначе detail
        alt:
          props.image?.alt ||
          props.image?.src.slice(
            props.image.src.lastIndexOf('/') + 1,
            props.image.src.lastIndexOf('.'),
          ) ||
          'detail',
      },
      mainText: props.mainText,
      addText: props.addText || null,
    };
    console.log(`Создан элемент класса RestaurantDetail со следующими пропсами: ${this.props}`);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find restaurant-detail with id ${this.props.id}`);
    }
    return element;
  }

  /**
   * Отображает деталь ресторана на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Error: restaurant-detail template not found');
    }
    // Рендерим шаблончик
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
  }

  /**
   * Удаляет деталь ресторана
   */
  remove(): void {
    const element = this.self;
    element.remove();
  }
}
