import { Button, ButtonProps } from 'doordashers-ui-kit';
import { CategoryHeader } from '@components/categories/categoryHeader/categoryHeader';
import template from './categories.hbs';

/**
 * Класс категорий
 */
export class Categories {
  private parent: HTMLElement;
  private readonly cardsComponent: HTMLElement;
  private categoryElements: { button: Button; header: CategoryHeader }[] = [];
  private activeCategoryId: number | null = null;
  private readonly boundScrollHandler: () => void;
  private readonly boundHashChangeHandler: () => void;

  /**
   * Создает экземпляр группы категорий.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться список категорий
   * @param cardsComponent
   */
  constructor(parent: HTMLElement, cardsComponent: HTMLElement) {
    this.parent = parent;
    this.cardsComponent = cardsComponent;
    this.boundScrollHandler = this.scrollHandler.bind(this);
    this.boundHashChangeHandler = this.hashChangeHandler.bind(this);
  }

  hashChangeHandler(): void {
    const hashCategoryId = parseInt(window.location.hash.replace('#category-', ''), 10);
    if (
      !isNaN(hashCategoryId) &&
      hashCategoryId < this.categoryElements.length &&
      hashCategoryId !== this.activeCategoryId
    ) {
      this.handleCategoryClick(hashCategoryId);
    } else {
      const currentUrl = window.location.href.split('#')[0];
      history.replaceState(null, '', currentUrl);
    }
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
  }

  /**
   * Отображает список категорий на странице.
   */
  render(): void {
    if (!template) {
      throw new Error('Error: categories template not found');
    }

    const html = template();
    this.parent.insertAdjacentHTML('beforeend', html);

    window.addEventListener('scroll', this.boundScrollHandler);
    window.addEventListener('hashchange', this.boundHashChangeHandler);
  }

  addCategory(category: string): void {
    const categoryId = this.categoryElements.length;

    const buttonProps: ButtonProps = {
      id: `category-${categoryId}`,
      text: category,
      style: 'categories__button',
      onSubmit: () => this.handleCategoryClick(categoryId),
    };

    const header = new CategoryHeader(this.cardsComponent, category, categoryId);
    header.render();

    const newCategoryButton = new Button(this.self, buttonProps);
    newCategoryButton.render();

    this.categoryElements.push({ button: newCategoryButton, header });

    if (
      this.activeCategoryId === null ||
      this.activeCategoryId === this.categoryElements.length - 1
    ) {
      newCategoryButton.self.classList.add('button_active');
      if (this.activeCategoryId === null) {
        this.activeCategoryId = categoryId;
      } else {
        this.handleCategoryClick(this.activeCategoryId);
      }
    }
  }

  /**
   * Обработчик нажатия на категорию.
   */
  handleCategoryClick(categoryId: number): void {
    const targetHeader = document.getElementById(`category-header-${categoryId}`);
    if (targetHeader) {
      targetHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private scrollHandler(): void {
    let closestHeaderId: number | null = null;
    let closestDistance = Infinity;

    for (const { header } of this.categoryElements) {
      const headerElement = header.self;
      if (!headerElement) continue;

      const rect = headerElement.getBoundingClientRect();

      const isVisible = rect.bottom >= 0 && rect.top <= window.innerHeight;
      if (isVisible) {
        const distanceFromCenter = Math.abs((rect.top + rect.bottom) / 2 - window.innerHeight / 2);
        if (distanceFromCenter < closestDistance) {
          closestDistance = distanceFromCenter;
          closestHeaderId = header.id;
        }
      }
    }

    if (closestHeaderId !== null && closestHeaderId !== this.activeCategoryId) {
      this.updateActiveCategory(closestHeaderId);
    }
  }

  private updateActiveCategory(newCategoryId: number): void {
    const prevButton = this.categoryElements[this.activeCategoryId]?.button;

    if (prevButton) prevButton.self.classList.remove('button_active');
    this.activateButton(newCategoryId);

    this.activeCategoryId = newCategoryId;

    const currentUrl = window.location.href.split('#')[0];
    history.replaceState(null, '', `${currentUrl}#category-${newCategoryId}`);
  }

  private activateButton(id: number): void {
    const newButton = this.categoryElements[id]?.button;
    if (newButton) {
      newButton.self.classList.add('button_active');

      const container = newButton.self.parentElement;
      if (container) {
        const offset =
          newButton.self.offsetLeft - container.clientWidth / 2 + newButton.self.offsetWidth / 2;

        container.scrollTo({
          left: offset,
          behavior: 'smooth',
        });
      }
    }
  }

  /**
   * Удаляет категории со страницы
   */
  remove(): void {
    const element = this.self;
    for (const { button, header } of this.categoryElements) {
      button.remove();
      header.remove();
    }
    window.removeEventListener('scroll', this.boundScrollHandler);
    window.removeEventListener('hashchange', this.boundHashChangeHandler);

    element.innerHTML = '';
    this.categoryElements = [];
  }
}
