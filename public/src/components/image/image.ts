/**
 * Класс компонента изображения
 */
export class ImageComponent {
  private parent: HTMLElement;
  private readonly props: {
    id: string;
    picture: string;
  };

  /**
   * Создает экземпляр картинки.
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться картинка.
   * @param id - Идентификатор картинки на странице.
   * @param picture - Путь до картинки.
   */
  constructor(parent: HTMLElement, id: string, picture: string) {
    this.parent = parent;
    this.props = { id, picture };
  }

  /**
   * Отображает картинку на странице.
   */
  render(): void {
    const template = (window as any).Handlebars.templates['image.hbs'];
    if (!template) {
      throw new Error('Шаблон image.hbs не найден');
    }

    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
  }
}
