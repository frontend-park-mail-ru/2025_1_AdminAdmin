import { router } from '../../modules/routing.js';
import { userStore } from '../../store/userStore.js';

export default class RegisterPage {
  #parent;
  #template;
  #page;
  #clickHandler;

  constructor(parent) {
    this.#parent = parent;
    this.#template = Handlebars.templates['registerPage.hbs'];
    this.#page = null;
    this.#clickHandler = this.#handleClick.bind(this);
  }

  render() {
    this.#page = this.#template();
    this.#addEventListeners();
    this.#parent.innerHTML = this.#page;
  }

  #addEventListeners() {
    document.addEventListener('click', this.#clickHandler);
  }

  #handleClick(event) {
    const signupLink = event.target.closest('.signin-link');
    if (signupLink) {
      router.goToPage('loginPage');
    }

    const registerButton = event.target.closest('.register-form__register-button');
    if (registerButton) {
      event.preventDefault();

      const form = registerButton.closest('form');
      if (!form) return;

      const loginInput = form.querySelector('input[type="text"]');
      const passwordInput = form.querySelector('input[type="password"]');

      if (loginInput && passwordInput) {
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        userStore
          .register({ login, password })
          .then(() => {
            router.goToPage('home');
          })
          .catch((err) => {
            console.error('Register failed:', err);
          });
      }
    }
  }

  remove() {
    document.removeEventListener('click', this.#clickHandler);
    this.#parent.innerHTML = '';
  }
}
