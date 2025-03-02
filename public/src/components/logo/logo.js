/* Логотип */
export class logo {
    #parent;        // Родитель (где вызывается)
    #props = {      // Свойства лого
        image: "",     // картинка логотипа
    };

    /* Конструктор */
    constructor(parent, image) {
        this.#parent = parent;
        this.#props = {image: image}
    }

    /* Ссылка на объект */
    get self(){
        return document.querySelector("logo");
    } 

    /* Действие при нажатии */
    #handleClick() {
        this.self.addEventListener("click", () => {
            router.redirect("/");   // Редирект на главную
        });
    }

    /* Рендер */
    render(){
        template = window.Handlebars.templates["logo.hbs"];
        html = template(this.#props);
        this.#parent.insertAdjacentHTML("beforeend", html);
        this.#handleClick();
    }

    /* При удалении объекта */
    #destructor(){
        this.self.removeEventListener("click", () => {
            router.goToPage('home');   // Переход на главную страницу
        });
    } 
}