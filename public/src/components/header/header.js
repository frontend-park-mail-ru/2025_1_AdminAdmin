import goToPage from "../../modules/routing.js";

export default class Header {
    constructor(parent) {
        this.parent = parent;
        this.template = Handlebars.templates["header.hbs"];
    }

    render() {
        this.parent.innerHTML = this.template();
        this._addEventListeners();
    }

    _addEventListeners() {
        document.addEventListener("click", (event) => {
            const logo = event.target.closest(".logo");
            const loginButton = event.target.closest(".login-button");

            if (logo) {
                goToPage('home');
            }

            if (loginButton) {
                goToPage('loginPage');
            }
        });
    }
}
