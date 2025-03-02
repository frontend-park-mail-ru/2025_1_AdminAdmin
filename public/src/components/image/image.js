/* Изображение */
export class image {
    #parent;            // Родитель (где вызывается)
    #props = {          // Свойства изображения
        id: "",         // Id для идентификации
        picture: "",    // url для отображения
    };

    /* Конструктор */
    constructor(parent, id, picture) {
        this.#parent = parent;
        this.#props = {id: id, picture: picture}
    }

    /* Рендер */
    render(){
        const template = window.Handlebars.templates["image.hbs"];
        const html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
    }
}