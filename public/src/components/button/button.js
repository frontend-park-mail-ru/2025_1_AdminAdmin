/* Кнопка */
export class button {
  #parent;  // Родитель (где вызывается)
  #props = {  // Свойства кнопки
    id: '',               // Id для идентификации
    text: '',             // text для отображения
    style: '',            // Дополнительный стиль css
    onSubmit: undefined,  // Функция при нажатии
  };  

    /* Конструктор */
    constructor(parent, props) {
        if (!parent) {
          throw new Error("Button: no parent!");
        }
        this.#parent = parent;
        this.#props = {
          id: props.id, 
          text: props.text,
          style: props.style,
          onSubmit: props.onSubmit,
        };
    }

  /* Ссылка на объект */
  get self() {
    return document.getElementById(this.#props.id);
  }

  /* Действие при нажатии */
  #handleClick() {
    if (this.#props.onSubmit !== undefined) {
      this.self.addEventListener('click', (event) => {
        event.preventDefault(); // Отменяем дефолтное дейтсвие
        this.#props.onSubmit(); // Вызываем новое
      });
    }
  }

  /* Рендер */
  render = () => {
    const template = window.Handlebars.templates['button.hbs'];
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);
    if (!parent) {
      throw new Error("Button: invalid self!");
    }
    this.self.className += ` ${this.#props.style}`;
    this.#handleClick();
  }

  /* При удалении объекта */
  remove(){
      if (this.#props.onSubmit !== undefined) {
          this.self.removeEventListener("click", (event) => {
              event.preventDefault(); // Отменяем дефолтное дейтсвие
              this.#props.onSubmit();       // Вызываем новое
          });
      }
  } 
}
