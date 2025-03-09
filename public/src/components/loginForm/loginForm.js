import { Form } from "../form/form.js";
import { router } from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";
import {FormInput} from "../form/formInput/formInput.js";
import {Button} from "../button/button.js";
import {ValidateLogin, ValidatePassword} from "../../modules/validation.js";

/**
 * Класс, представляющий форму логина.
 */
export default class LoginForm {
    #parent;
    #config;

    #loginInput;
    #passwordInput;
    #submitBtn;

    /**
     * Конструктор класса
     * @param parent {HTMLElement} - родительский элемент
     * @param config {Object} - пропсы
     */
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
    }

    /**
     * Получение HTML элемента формы
     * @returns {HTMLElement}
     */
    get self () {
        return document.getElementById(this.#config.id);
    }

    /**
     * Валидация данных
     */
    validateData = () => {
        const login = this.#loginInput.value.trim();
        const password = this.#passwordInput.value;

        const validateLogin = this.#validateLogin();
        const validatePassword = this.#validatePassword();
        if (validateLogin && validatePassword) {
            userStore
                .login({ login, password })
                .then(() => {
                    router.goToPage("home");
                })
                .catch((err) => {
                    console.error("Login failed:", err);
                });
        }
    };

    /**
     * Валидация логина
     * @returns {boolean}
     */
    #validateLogin(){
        const value = this.#loginInput.value;

        const validationResult = ValidateLogin(value);

        if (validationResult.result) {
            this.#loginInput.cleanError();
            this.#loginInput.self.classList.add("success");
        } else {
            this.#loginInput.throwError(validationResult.message);
        }

        return validationResult.result;
    }

    /**
     * Валидация пароля
     * @returns {boolean}
     */
    #validatePassword(){
        const value = this.#passwordInput.value;

        const validationResult = ValidatePassword(value);

        if (!validationResult.result){
            this.#passwordInput.throwError(validationResult.message);
            return false;
        }

        if (validationResult.result) {
            this.#passwordInput.cleanError();
            this.#passwordInput.self.classList.add("success");
        }

        return validationResult.result;
    }

    /**
     * Обработка события ввода данных
     * @param id {number}
     */
    #inputEventHandler = (id) => {
        if(id === this.#passwordInput.id){
            this.#validatePassword();
        } else if (id === this.#loginInput.id){
            this.#validateLogin();
        }
    };

    /**
     * Отображение сообщения об ошибках
     */
    #throwIncorrectData = () => {
        this.#loginInput.throwError("Неправильный логин или пароль!");
        this.#passwordInput.throwError("Неправильный логин или пароль!");
    };

    /**
     * Очистка
     */
    remove(){
        this.#submitBtn.remove();
    }

    /**
     * Рендеринг формы
     */
    render() {
        const template = window.Handlebars.templates["loginForm.hbs"];
        this.#parent.innerHTML =  template(undefined);

        const loginContainer = document.getElementById("form__line_login");
        const passwordContainer = document.getElementById("form__line_password");
        const buttonContainer = document.getElementById("form__line_login_button");

        this.#loginInput = new FormInput(loginContainer, this.#config.inputs.login);
        this.#loginInput.render();

        this.#passwordInput = new FormInput(passwordContainer, this.#config.inputs.password);
        this.#passwordInput.render();

        this.#submitBtn = new Button(buttonContainer, this.#config.buttons.submitBtn, this.validateData);
        this.#submitBtn.render();
    }
}
