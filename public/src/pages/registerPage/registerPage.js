import { router } from '../../modules/routing.js';
import { userStore } from '../../store/userStore.js';
import { form } from '../../components/form/form.js';

/**
 * Класс, представляющий страницу регистрации.
 */
export default class RegisterPage {
  #parent;

  /**
   * Создает экземпляр страницы регистрации.
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться страница
   */
  constructor(parent) {
    this.#parent = parent;
  }

  /* Ссылка на объект */
  get self() {
    return document.querySelector('.registerPage__body');
  }

  /**
   * Рендерит страницу регистрации в родительский элемент.
   * Добавляет обработчики событий для кликов по элементам страницы.
   */
  render() {
    const template = window.Handlebars.templates["registerPage.hbs"];
    const html = template();
    this.#parent.innerHTML = html;
    const register_form = new form(this.self, {
      tabs: [
        {type: "button", props: {id: "form__tab_register", text: "Регистрация", onSubmit: () => {router.goToPage('registerPage');}, style: "form__button button_active"}},
        {type: "button", props: {id: "form__tab_login", text: "Логин", onSubmit: () => {router.goToPage('loginPage');}, style: "form__button button_inactive"}},
      ],
      lines: [
        { id: "form__line_firstname_lastname",
          components: [
            {type: "form__input", props: { id: "form__line__firstname", label: "Имя", props: { id: "form__line__firstname__input", placeholder: "Введите имя"}}},
            {type: "form__input", props: { id: "form__line__lastname", label: "Фамилия", props: { id: "form__line__lastname__input", placeholder: "Введите фамилию"}}},
          ]
        },
        { id: "form__line_phone",
          components: [
            {type: "form__input", props: { id: "form__line__phone_code", label: "Код страны", props: { id: "form__line__phone_code__input", placeholder: "Введите код"}}},
            {type: "form__input", props: { id: "form__line__phone", label: "Телефон", props: { id: "form__line__phone__input", placeholder: "Введите телефон"}}},
          ]
        },
        { id: "form__line_login",
          components: [
            { type: "form__input", props: { id: "form__line__login", label: "Логин", props: { id: "form__line__login__input", placeholder: "Введите логин"}}},
          ]
        },
        { id: "form__line_password",
          components: [
            {type: "form__input", props: { id: "form__line__password", label: "Пароль", description: "Не менее 10 символов", props: { id: "form__line__password__input", placeholder: "Введите пароль"}}}
          ]
        },
        {id: "form__line_register_button",
          components: [
            {type: "button", props: { 
              id: "form__line__register_button",
              text: "Зарегистрироваться",
              onSubmit: () => {
                const loginInput = document.getElementById("form__line__login__input").value.trim();
                const passwordInput = document.getElementById("form__line__password__input").value.trim();
                userStore
                  .register({ login: loginInput, password: passwordInput })
                  .then(() => {router.goToPage('home');})
                  .catch((err) => {console.error('Register failed:', err);});
              }, 
              style: "form__button button_active"}
            }
          ],
          style: "form__line_submit_button"
        }
      ],
    });
    register_form.render();
  }

  
  remove() {
    this.#parent.innerHTML = '';
  }
}
