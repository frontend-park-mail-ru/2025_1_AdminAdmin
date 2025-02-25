import goToPage from "../../modules/routing.js";

export default class LoginPage {
    constructor(parent) {
        this.parent = parent;
        this.template = Handlebars.templates["loginPage.hbs"];
        this.page = null;
    }

    render() {
        this.page = this.template();
        this._addEventListeners();
        this.parent.innerHTML = this.page;
    }

    _addEventListeners() {
        document.addEventListener("click", (event) => {
            const signupLink = event.target.closest(".signup-link");
            if (signupLink) {
                goToPage('registerPage');
            }
        });
    }
}
