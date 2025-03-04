/* Поле ввода */
export class input {
  #parent; // Родитель (где вызывается)
  #props = {
    // Свойства поля ввода
    id: '', // Id для идентификации
    placeholder: '', // начальный текст
  };

  /* Конструктор */
  constructor(parent, id, placeholder) {
    this.#parent = parent;
    this.#props = { id: id, placeholder: placeholder };
  }

  /* Рендер */
  render() {
    const template = window.Handlebars.templates['input.hbs'];
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);
  }
}
