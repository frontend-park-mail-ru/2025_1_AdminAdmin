import template from './category.hbs';

// Структура класса категории (нужно для конструктора)
export interface CategoryProps {
  // ? - необязательное поле
  id: string; // Идентификатор категории
  name: string; // Название категории
  onSubmit?: (clickedCategory: Category) => void; // Функция при нажатии
}

/**
 * Класс категории
 */
export class Category {
  protected parent: HTMLElement; // Родитель (где вызывается)
  protected props: CategoryProps; // Свойства
  protected clickHandler: (event: Event) => void;

  /**
   * Создает экземпляр категории.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться категория
   * @param {Object} props - Словарь данных для определения свойств категории
   */
  constructor(parent: HTMLElement, props: CategoryProps) {
    if (!parent) {
      throw new Error('Category: no parent!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      name: props.name,
      onSubmit: props.onSubmit ?? undefined,
    };
    this.clickHandler = this.handleClick.bind(this);
    console.log(
      `Создан элемент класса Category со следующими пропсами: ${JSON.stringify(this.props)}`,
    );
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Category: can't find category with id=${this.props.id}`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Функция рендера категории на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Category: category template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    this.self.addEventListener('click', this.clickHandler);
  }

  /**
   * Обработчик нажатия на категорию.
   * @private
   */
  handleClick(event: Event): void {
    console.log(`Category: Нажали категорию ${this.props.name}`);
    event.preventDefault();
    if (this.props.onSubmit !== undefined) {
      this.props.onSubmit(this);
    }
  }

  /**
   * Обновляет стиль категории
   */
  updateStyle(): void {
    const element = this.self;
    if (element.classList.contains('category_active')) {
      element.classList.remove('category_active');
    } else {
      element.classList.add('category_active');
    }
  }

  get getProps(): CategoryProps {
    return this.props;
  }

  /**
   * Удаляет категорию со страницы и снимает обработчики событий.
   */
  remove(): void {
    const element = this.self;
    element.removeEventListener('click', this.clickHandler); // Удаляем обработчик
    element.remove(); // Вызывается метод DOM remove()
  }
}
