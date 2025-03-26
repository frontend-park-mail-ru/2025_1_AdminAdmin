import { Category, CategoryProps } from '../category/category';

import template from './categories.hbs';

// Структура класса категорий (нужно для конструктора)
export interface CategoriesProps {
  // ? - необязательное поле
  categoriesList: Array<CategoryProps>;
  activeCategoryId?: string | null; // Ссылка на активную категорию
}

/**
 * Класс категорий
 */
export class Categories {
  protected parent: HTMLElement; // Родитель (где вызывается)
  protected props: CategoriesProps; // Свойства

  /**
   * Создает экземпляр группы категорий.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список категорий
   * @param {CategoriesProps} props - Словарь данных для определения свойств списка категорий
   */
  constructor(parent: HTMLElement, props: CategoriesProps) {
    if (!parent) {
      throw new Error('Categories: no parent!');
    }
    this.parent = parent;
    this.props = {
      categoriesList: props.categoriesList,
      activeCategoryId: props.activeCategoryId ?? props.categoriesList[0]?.id ?? null,
    };
    //console.log(`Создан элемент класса Categories со следующими пропсами: ${this.props}`)
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.querySelector('.categories');
    if (!element) {
      throw new Error(`Error: can't find categories`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Обработчик нажатия на категорию.
   * @private
   */
  handleClick(clickedCategory: CategoryProps): void {
    console.log(clickedCategory);
  }

  /**
   * Отображает список категорий на странице.
   */
  render(): void {
    if (!template) {
      throw new Error('Error: categories template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    // Заполняем
    this.props.categoriesList.forEach((categoryProps) => {
      categoryProps.onSubmit = this.handleClick.bind(this);
      categoryProps.isActive = categoryProps.id === this.props.activeCategoryId;
      // Создаем и рендерим категорию
      const categoryComponent = new Category(this.self, categoryProps);
      categoryComponent.render();
    });
  }

  /**
   * Удаляет категории со страницы
   */
  remove(): void {
    const element = this.self;
    const categoriesList = document.querySelectorAll('.category');
    categoriesList.forEach((categoryElement) => {
      categoryElement.remove();
    });
    element.remove();
    // Снять обработчики
  }
}
