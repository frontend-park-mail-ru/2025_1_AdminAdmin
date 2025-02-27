import { router } from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";

export default class LoginPage {
    #parent;
    #template;
    #page;
    #clickHandler;

    constructor(parent) {
        this.#parent = parent;
        this.#template = Handlebars.templates["loginPage.hbs"];
        this.#page = null;
        this.#clickHandler = this.#handleClick.bind(this);
    }

    render() {
        this.#page = this.#template();
        this.#parent.innerHTML = this.#page;
        document.addEventListener("click", this.#clickHandler);
    }

    #handleClick(event) {
        const signupLink = event.target.closest(".signup-link");
        if (signupLink) {
            router.goToPage("registerPage");
        }

        const loginButton = event.target.closest(".login-form__login-button");
        if (loginButton) {
            event.preventDefault();

            const form = loginButton.closest("form");
            if (!form) return;

            const loginInput = form.querySelector('input[type="text"]');
            const passwordInput = form.querySelector('input[type="password"]');

            if (loginInput && passwordInput) {
                const login = loginInput.value.trim();
                const password = passwordInput.value.trim();

                userStore.login({ login, password }).then(() => {
                    router.goToPage("home");
                })
                .catch((err) => {
                    console.error("Login failed:", err);
                });
            }
        }
    }

    remove() {
        document.removeEventListener("click", this.#clickHandler);
        this.#parent.innerHTML = "";
    }
}
