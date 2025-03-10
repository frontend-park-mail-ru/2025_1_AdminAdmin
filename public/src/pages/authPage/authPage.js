import {Button} from "../../components/button/button.js";
import config from "./authPageConfig.js";
import LoginForm from "../../components/loginForm/loginForm.js";
import RegisterForm from "../../components/registerForm/registerForm.js";

export class AuthPage {
    #loginForm;
    #registerForm;
    #parent;
    #loginButton;
    #registerButton;

    #loginFormSelector = ".authPage__login";
    #registerFormSelector = ".authPage__register";
    #formLineSelector = ".authPage__line";

    constructor(parent) {
        this.#parent = parent;
    }

    render = () => {
        const template = window.Handlebars.templates["authPage.hbs"];
        this.#parent.innerHTML = template(undefined);

        const formLine = this.#parent.querySelector(this.#formLineSelector);

        this.#registerButton = new Button(formLine, {
            ...config.buttons.register,
            onSubmit: () => {
                this.toggleRegisterForm();
            }
        });
        this.#registerButton.render();

        this.#loginButton = new Button(formLine, {
            ...config.buttons.login,
            onSubmit: () => {
                this.toggleLoginForm();
            }
        });
        this.#loginButton.render();

        this.#isLoginPage() ? this.renderLoginForm() : this.renderRegisterForm();
    }

    /**
     * Отображение формы входа
     * Вызывается один раз, если url заканчивается на /login
     */
    renderLoginForm = () => {
        this.#parent.querySelector(this.#loginFormSelector).style.display = 'contents';
        this.#parent.querySelector(this.#registerFormSelector).style.display = 'none';
        this.#loginButton.toggleClass('button_inactive', 'button_active');
        this.#registerButton.toggleClass('button_active', 'button_inactive');

        if (this.#loginForm === undefined) {
            this.#loginForm = new LoginForm(this.#parent.querySelector(this.#loginFormSelector), config.forms.login);
            this.#loginForm.render();
        }
    };

    /**
     * Отображение формы регистрации
     * Вызывается один раз, если url заканчивается на /register
     */
    renderRegisterForm = () => {
        this.#parent.querySelector(this.#loginFormSelector).style.display = 'none';
        this.#parent.querySelector(this.#registerFormSelector).style.display = 'contents';
        this.#loginButton.toggleClass('button_active', 'button_inactive');
        this.#registerButton.toggleClass('button_inactive', 'button_active');

        if (this.#registerForm === undefined) {
            this.#registerForm = new RegisterForm(this.#parent.querySelector(this.#registerFormSelector), config.forms.register);
            this.#registerForm.render();
        }
    };

    /**
     * Прячет форму регистрации и отображает форму входа
     * Вызывается при нажатии на кнопку "Уже зарегистрированы?"
     */
    toggleLoginForm = () => {
        history.pushState(null, null, "login");
        this.renderLoginForm();
    };

    /**
     * Прячет форму входа и отображает форму регистрации
     * Вызывается при нажатии на кнопку "Ещё нет аккаунта?"
     */
    toggleRegisterForm = () => {
        history.pushState(null, null, "register");
        this.renderRegisterForm();
    };

    /**
     * Очищает DOM
     */
    remove() {
        if (this.#loginForm !== undefined) {
            this.#loginForm.remove();
            this.#loginForm = undefined;
        }

        if (this.#registerForm !== undefined) {
            this.#registerForm.remove();
            this.#registerForm = undefined;
        }

        this.#loginButton.remove();
        this.#registerButton.remove();

        this.#parent.innerHTML = "";
    }

    /**
     * Возвращает true, если открыта страница логина
     * @returns {boolean}
     */
    #isLoginPage() {
        return window.location.pathname === '/login';
    }
}