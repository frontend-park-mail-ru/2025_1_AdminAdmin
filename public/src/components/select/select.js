import template from './select.hbs';

/* Селект (выпадающий список) */
export class Select {
  #parent; // Родитель (где вызывается)
  #props = {
    // Свойства селекта
    id: '', // Id для идентификации
    label: '', // Метка для отображения
    options: [], // Массив опций
    style: '', // Дополнительный стиль css
  };

  /* Конструктор */
  constructor(parent, props) {
    if (!parent) {
      throw new Error('Select: no parent!');
    }
    this.#parent = parent;
    this.#props = {
      id: props.id,
      label: props.label,
      options: props.options,
      style: props.style,
    };
  }

  /* Ссылка на объект */
  get self() {
    return document.getElementById(this.#props.id);
  }

  get value() {
    return this.self?.value || null;
  }

  /* Рендер */
  render = () => {
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);
    if (!this.self) {
      throw new Error('Select: invalid self!');
    }
    if (this.#props.style) {
      this.self.classList.add(...this.#props.style.split(' '));
    }
  };

  /* При удалении объекта */
  remove() {}
}
