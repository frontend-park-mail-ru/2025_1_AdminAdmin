import { cli } from 'webpack';
import { Category, CategoryProps } from '../category/category';

import template from './categories.hbs';

// Структура класса категорий (нужно для конструктора)
export interface CategoriesProps {
  // ? - необязательное поле
  categoriesList: Array<CategoryProps>;
  activeCategoryId?: string | null; // Ссылка на активную категорию
  onChange?: (categoryName: string) => void; // Калбек функция при изменении
}

/**
 * Класс категорий
 */
export class Categories {
  protected parent: HTMLElement; // Родитель (где вызывается)
  protected props: CategoriesProps; // Свойства
  protected categoriesComponentsList: Array<Category> = []; // Список компонентов категорий

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
      onChange: props.onChange || undefined,
    };
    console.log(
      `Создан элемент класса Categories со следующими пропсами: ${JSON.stringify(this.props)}`,
    );
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

  get getProps(): CategoriesProps {
    return this.props;
  }

  /**
   * Обработчик нажатия на категорию.
   * @private
   */
  handleChange(clickedCategory: Category): void {
    console.log(`Передали в Categories категорию ${Category}`);
    if (this.props.onChange) {
      // Если задан калбек
      const clickedCategoryId = clickedCategory.getProps.id;
      if (clickedCategoryId !== this.props.activeCategoryId) {
        this.categoriesComponentsList
          .find((category) => category.getProps.id === this.props.activeCategoryId)
          .updateStyle();
        clickedCategory.updateStyle();
        this.props.activeCategoryId = clickedCategoryId;
        this.props.onChange(clickedCategory.getProps.name);
      }
    }
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
      categoryProps.onSubmit = this.handleChange.bind(this);
      // Создаем и рендерим категорию
      console.log(
        `Рендерим категорию, вызываем конструктор для Category со следующими пропсами: ${JSON.stringify(categoryProps)}`,
      );
      this.categoriesComponentsList.push(new Category(this.self, categoryProps));
      console.log(this.categoriesComponentsList);
      this.categoriesComponentsList[this.categoriesComponentsList.length - 1].render();
      console.log(`Отрендерили категорию`);
      if (categoryProps.id === this.props.activeCategoryId) {
        console.log(`Нашли активную категорию`);
        this.categoriesComponentsList[this.categoriesComponentsList.length - 1].updateStyle();
      }
    });
    console.log(
      `Создан следующий список категорий: ${JSON.stringify(this.categoriesComponentsList)}`,
    );
  }

  /**
   * Удаляет категории со страницы
   */
  remove(): void {
    const element = this.self;
    while (this.categoriesComponentsList.length > 0) {
      this.categoriesComponentsList.pop().remove();
    }
    element.remove();
    // Снять обработчики
  }
}
