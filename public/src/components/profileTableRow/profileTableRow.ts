import template from './profileTableRow.hbs';

//Интерфейс картинки ресторана
export interface ImageProps {
  src: string;
  alt?: string;
}

// Интерфейс компонента (нужен для рендера)
export interface RestaurantProps {
  name: string;
  image?: ImageProps | string; // Будем передавать как строку, а преобразовывать как ImageProps
}

// Интерфейс пропсов строки в таблице
export interface ProfileTableRowProps {
  id: string;
  status: boolean; // 0 - в пути, 1 - завершен
  create_date: string; // Дата создания заказа
  price: number; // Общая стоимость заказа
  products_amount: number; // Количество товаров в заказе
  restaurant: RestaurantProps; // Пропсы ресторана (название + картинка)
  onClick?: () => void;
}

export class ProfileTableRow {
  protected parent: HTMLElement;
  protected props: ProfileTableRowProps;
  protected clickHandler: (event: Event) => void;

  /**
   * @constructor Создает экземпляр строки таблицы на странице профиля
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться строка таблицы
   * @param {TableRowProps} props - Словарь данных для определения свойств строки таблицы
   */
  constructor(parent: HTMLElement, props: ProfileTableRowProps) {
    if (!parent) {
      throw new Error('TableRow: no parent!');
    }
    console.log('ProfileTableRow: Прошли проверки в конструкторе');
    this.parent = parent;
    this.props = {
      id: props.id,
      status: props.status,
      create_date: props.create_date,
      price: props.price,
      products_amount: props.products_amount,
      restaurant: {
        image: {
          src: '/src/assets/burgerking.png',
          alt: 'burgerking',
        },
        name: props.restaurant.name,
      },
      onClick: props.onClick || undefined,
    };
    if (props.restaurant.image) {
      // Обработка переданной картинки ресторана
      if (typeof props.restaurant.image === 'string') {
        this.props.restaurant.image = {
          src: props.restaurant.image,
          alt: props.restaurant.image.split('/').pop()?.split('.').shift() || 'restaurant-image',
        } as ImageProps;
      } else {
        this.props.restaurant.image = {
          src: props.restaurant.image.src,
          alt: props.restaurant.image.alt || 'restaurant-image',
        } as ImageProps;
      }
    }
    console.log('Записали пропсы');
    this.clickHandler = this.handleClick.bind(this);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Category: can't find profile-table-row with id=${this.props.id}`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Функция рендера категории на странице
   */
  render(): void {
    if (!template) {
      throw new Error('ProfileTableRow: profile-table-row template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    this.self.addEventListener('click', this.clickHandler);
  }

  /**
   * Обработчик нажатия на строку таблицы
   * @private
   */
  handleClick(event: Event): void {
    event.preventDefault();
    if (this.props.onClick !== undefined) {
      this.props.onClick();
    }
  }

  /**
   * Удаляет строку из таблицы и убирает обработчики
   */
  remove(): void {
    const element = this.self;
    element.removeEventListener('click', this.clickHandler); // Удаляем обработчик
    element.remove();
  }
}
