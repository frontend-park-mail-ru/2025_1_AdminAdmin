/**
 * Класс компонента изображения
 */
export class image {
  #parent; // Родитель (где вызывается)
  #props = {
    // Свойства изображения
    id: '', // Id для идентификации
    picture: '', // url для отображения
  };

  /**
   * Создает экземпляр картинки.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться картинка.
   * @param {String} id - Идентификатор картинки на странице
   * @param {String} picture - Путь до картинки
   */
  constructor(parent, id, picture) {
    this.#parent = parent;
    this.#props = { id: id, picture: picture };
  }

  /**
   * Отображает картинку на странице.
   */
  render() {
    const template = window.Handlebars.templates['image.hbs'];
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);
  }
}
