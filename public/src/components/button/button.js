/* Кнопка */
export class button {
  #parent; // Родитель (где вызывается)
  #props = {
    // Свойства кнопки
    id: '', // Id для идентификации
    text: '', // text для отображения
  };
  #style;
  #onSubmit; // Функция при нажатии

    /* Конструктор */
    constructor(parent, id, text, onSubmit=undefined, style="button") {
        this.#parent = parent;
        this.#props = {id: id, text: text};
        this.#onSubmit = onSubmit;
        this.#style = style;
    }

  /* Ссылка на объект */
  get self() {
    return document.getElementById(this.#props.id);
  }

  /* Действие при нажатии */
  #handleClick() {
    if (this.#onSubmit !== undefined) {
      this.self.addEventListener('click', (event) => {
        event.preventDefault(); // Отменяем дефолтное дейтсвие
        this.#onSubmit(); // Вызываем новое
      });
    }
  }

  /* Рендер */
  render() {
    const template = window.Handlebars.templates['button.hbs'];
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);
    this.self.className = this.#style;
    this.#handleClick();
  }

    /* При удалении объекта */
    remove(){
        if (this.#onSubmit !== undefined) {
            this.self.removeEventListener("click", (event) => {
                event.preventDefault(); // Отменяем дефолтное дейтсвие
                this.#onSubmit();       // Вызываем новое
            });
        }
    } 
}
