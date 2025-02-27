import { router } from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";

export default class Header {
    #parent;
    #template;
    #clickHandler;

    constructor(parent) {
        this.#parent = parent;
        this.#template = Handlebars.templates["header.hbs"];
        this.#clickHandler = this.#handleClick.bind(this); // Привязка контекста

        userStore.subscribe(() => this.updateAuthState());
    }

    render() {
        this.#parent.innerHTML = this.#template();
        this.#addEventListeners();
        this.updateAuthState();
    }

    #addEventListeners() {
        document.addEventListener("click", this.#clickHandler);
    }

    #handleClick(event) {
        const logo = event.target.closest(".logo");
        const loginButton = event.target.closest(".login-button");
        const logoutButton = event.target.closest(".logout-button");

        if (logo) {
            router.goToPage("home");
        }

        if (loginButton) {
            router.goToPage("loginPage");
        }

        if (logoutButton) {
            userStore.logout();
        }
    }

    updateAuthState() {
        const loginButton = this.#parent.querySelector(".login-button");
        const logoutButton = this.#parent.querySelector(".logout-button");

        if (userStore.isAuth()) {
            if (loginButton) loginButton.style.display = "none";
            if (logoutButton) logoutButton.style.display = "block";
        } else {
            if (loginButton) loginButton.style.display = "block";
            if (logoutButton) logoutButton.style.display = "none";
        }
    }

    remove() {
        document.removeEventListener("click", this.#clickHandler);
        this.#parent.innerHTML = "";
    }
}
