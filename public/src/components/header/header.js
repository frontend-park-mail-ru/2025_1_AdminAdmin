import goToPage from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";
import { logo } from "../logo/logo.js";
import logoImage from "../../logo.png"
import { button } from "../button/button.js";


export default class Header {
    #parent;
    #logo;
    #loginButton;
    #logoutButton;

    constructor(parent) {
        this.#parent = parent;
        userStore.subscribe(() => this.updateAuthState());
    }

    /* Ссылка на объект */
    get self(){
        return document.querySelector(".header");
    } 

    render() {
        const template = window.Handlebars.templates["image.hbs"];
        const html = template();
        this.#parent.insertAdjacentHTML("beforeend", html);
        this.#logo = new logo(this.self, logoImage);
        this.#logo.render();
        this.#loginButton = new button(this.self, "Вход");
        this.#logoutButton.render();
        this.#loginButton = new button(this.self, "Выход");
        this.#logoutButton.render();
        this.#handleClick();
        this.updateAuthState();
    }

    #handleClick() {
        document.addEventListener("click", (event) => {
            const logo = event.target.closest(".logo");
            const loginButton = event.target.closest(".login-button");
            const logoutButton = event.target.closest(".logout-button");

            if (logo) {
                goToPage("home");
            }

            if (loginButton) {
                goToPage("loginPage");
            }

            if (logoutButton) {
                userStore.logout();
            }
        });
    }

    updateAuthState() {
        const loginButton = this.parent.querySelector(".login-button");
        const logoutButton = this.parent.querySelector(".logout-button");

        if (userStore.isAuth()) {
            if (loginButton) loginButton.style.display = "none";
            if (logoutButton) logoutButton.style.display = "block";
        } else {
            if (loginButton) loginButton.style.display = "block";
            if (logoutButton) logoutButton.style.display = "none";
        }
    }
}
