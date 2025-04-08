import template from './categoryHeader.hbs';
/**
 * Класс заголовка категории
 */
export class CategoryHeader {
  private parent: HTMLElement;
  private readonly text: string;
  private readonly id: number;

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
   * Удаление заголовка
   */
  remove(): void {
    const element = document.getElementById(`category-header-${this.id}`);
    if (element) {
      element.remove();
    }
  }
}
