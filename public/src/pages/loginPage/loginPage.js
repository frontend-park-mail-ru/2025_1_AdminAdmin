import LoginForm from "../../components/loginForm/loginForm.js";

/**
 * Класс, представляющий страницу логина.
 */
export default class LoginPage {
  #parent;
  #loginForm;

  constructor(parent) {
    this.#parent = parent;
  }

  render() {
    const template = window.Handlebars.templates["loginPage.hbs"];
    this.#parent.innerHTML = template();

    this.#loginForm = new LoginForm(document.querySelector('.loginPage__body'));
    this.#loginForm.render();
  }

  remove() {
    this.#parent.innerHTML = '';
  }
}
