import { router } from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";
import {FormInput} from "../formInput/formInput.js";
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

        const validateLogin = this.#validateLogin(login);
        const validatePassword = this.#validatePassword(password);
        if (validateLogin && validatePassword) {
            userStore
                .login({ login, password })
                .then(() => {
                    router.goToPage("home");
                })
                .catch((err) => {
                    const errorMessage = err ? err.message : "Неверный логин или пароль";
                    this.setError(errorMessage);
                });
        }
    };

    /**
     * Валидация логина
     * @returns {boolean}
     */
    #validateLogin(login){
        const validationResult = ValidateLogin(login);

        if (validationResult.result) {
            this.#loginInput.clearError();
        } else {
            this.#loginInput.setError(validationResult.message);
        }

        return validationResult.result;
    }

    /**
     * Валидация пароля
     * @returns {boolean}
     */
    #validatePassword(password){
        const validationResult = ValidatePassword(password);

        if (!validationResult.result){
            this.#passwordInput.setError(validationResult.message);
            return false;
        }

        if (validationResult.result) {
            this.#passwordInput.clearError();
        }
        else {
            this.#passwordInput.setError(validationResult.message);
            return false;
        }

        return validationResult.result;
    }

    setError(errorMessage) {
        const errorElement = this.#parent.querySelector(".form__error");

        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = "block";
        }
    }

    /**
     * Очистка ошибки
     */
    clearError() {
        const errorElement = this.#parent.querySelector(".form__error");

        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
        }
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

        this.#submitBtn = new Button(buttonContainer, {
            ...this.#config.buttons.submitBtn,
            onSubmit: () => {
                this.validateData();
            }
        });
        this.#submitBtn.render();
    }

    /**
     * Очистка
     */
    remove(){
        this.#submitBtn.remove();
    }

}
