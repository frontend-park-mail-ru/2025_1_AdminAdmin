import { form } from "../../components/form/form.js";
import { router } from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";

/**
 * Класс, представляющий страницу логина.
 */
export default class LoginPage {
  #parent;

  /**
   * Создает экземпляр страницы логина.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться страница
   */
  constructor(parent) {
    this.#parent = parent;
  }

  /* Ссылка на объект */
  get self() {
    return document.querySelector('.loginPage__body');
  }

  /**
   * Рендерит страницу логина в родительский элемент.
   * Добавляет обработчик событий для кликов по элементам страницы.
   */
  render() {
    const template = window.Handlebars.templates["loginPage.hbs"];
    const html = template();
    this.#parent.innerHTML = html;
    console.log(this.self);
    const login_form = new form(this.self, {
      tabs: [
        {type: "button", props: {id: "form__tab_register", text: "Регистрация", onSubmit: () => {router.goToPage('registerPage');}, style: "form__button button_inactive"}},
        {type: "button", props: {id: "form__tab_login", text: "Логин", onSubmit: () => {router.goToPage('loginPage');}, style: "form__button button_active"}},
      ],
      lines: [
        { id: "form__line_login", 
          components: [
            {type: "form__input", props: {id: "form__line__login", label: "Логин", props: {id: "form__line__login__input", placeholder: "Введите логин"}}}
          ]
        },
        { id: "form__line_password",
          components: [
            {type: "form__input", props: { id: "form__line__password", label: "Пароль", props: { id: "form__line__password__input", placeholder: "Введите пароль"}}}
          ]
        },
        {id: "form__line_login_button",
          components: [
            { type: "button", props: { 
              id: "form__line__login_button",
              text: "Войти", 
              onSubmit: () => {
                const loginInput = document.getElementById("form__line__login__input").value.trim();
                console.log(loginInput);
                const passwordInput = document.getElementById("form__line__password__input").value.trim();
                console.log(passwordInput);
                userStore
                  .login({ login: loginInput, password: passwordInput })
                  .then(() => {router.goToPage('home');})
                  .catch((err) => {console.error('Login failed:', err);});
              },
              style: "form__button button_active"}
            }
          ],
          style: "form__line_submit_button"
        }
      ]
    });
    login_form.render();
  }

  /**
   * Удаляет страницу из родительского элемента и очищает события.
   */
  remove() {
    this.#parent.innerHTML = '';
  }
}
