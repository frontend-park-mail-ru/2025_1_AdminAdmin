import { router } from "../../modules/routing.js";

export default class RegisterPage {
    #parent;
    #template;
    #page;
    #clickHandler;

    constructor(parent) {
        this.#parent = parent;
        this.#template = Handlebars.templates["registerPage.hbs"];
        this.#page = null;
        this.#clickHandler = this.#handleClick.bind(this);
    }

    render() {
        this.#page = this.#template();
        this.#addEventListeners();
        this.#parent.innerHTML = this.#page;
    }

    #addEventListeners() {
        document.addEventListener("click", this.#clickHandler);
    }

    #handleClick(event) {
        const signupLink = event.target.closest(".signin-link");
        if (signupLink) {
            router.goToPage('loginPage');
        }
    }

    remove() {
        document.removeEventListener("click", this.#clickHandler);
        this.#parent.innerHTML = '';
    }
}
