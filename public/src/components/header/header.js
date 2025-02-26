import goToPage from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";

export default class Header {
    constructor(parent) {
        this.parent = parent;
        this.template = Handlebars.templates["header.hbs"];
        userStore.subscribe(() => this.updateAuthState());
    }

    render() {
        this.parent.innerHTML = this.template();
        this._addEventListeners();
        this.updateAuthState();
    }

    _addEventListeners() {
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
