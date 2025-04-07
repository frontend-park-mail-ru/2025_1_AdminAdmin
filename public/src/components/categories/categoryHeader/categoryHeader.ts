import template from './categoryHeader.hbs';
/**
 * Класс заголовка категории
 */
export class CategoryHeader {
  private parent: HTMLElement;
  private readonly text: string;
  readonly id: number;

  /**
   * Создает заголовок категории
   * @param parent - Родительский элемент, в который будет вставлен заголовок
   * @param text - Текст заголовка
   * @param id - Уникальный идентификатор (опционально)
   */
  constructor(parent: HTMLElement, text: string, id: number) {
    if (!parent) {
      throw new Error('CategoryHeader: no parent provided');
    }

    this.parent = parent;
    this.text = text;
    this.id = id;
  }

  /**
   * Метод для создания и вставки заголовка в DOM
   */
  render(): void {
    const headerElement = template({ id: this.id, text: this.text });
    this.parent.insertAdjacentHTML('beforeend', headerElement);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(`category-header-${this.id}`);
    if (!element) {
      throw new Error(`Error: can't find categories`);
    }
    return element as HTMLElement;
  }

  /**
   * Удаление заголовка
   */
  remove(): void {
    const element = this.self;
    if (element) {
      element.remove();
    }
  }
}
