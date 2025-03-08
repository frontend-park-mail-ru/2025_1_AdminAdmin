import { Form } from "../form/form.js";
import { router } from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";

/**
 * Класс, представляющий форму логина.
 */
export default class LoginForm {
    #parent;
    #form;

    constructor(parent) {
        this.#parent = parent;
    }

    render() {
        this.#form = new Form(this.#parent, {
            tabs: [
                {
                    type: "button",
                    props: {
                        id: "form__tab_register",
                        text: "Регистрация",
                        onSubmit: () => {
                            router.goToPage("registerPage");
                        },
                        style: "form__button button_inactive",
                    },
                },
                {
                    type: "button",
                    props: {
                        id: "form__tab_login",
                        text: "Логин",
                        onSubmit: () => {
                            router.goToPage("loginPage");
                        },
                        style: "form__button button_active",
                    },
                },
            ],
            lines: [
                {
                    id: "form__line_login",
                    components: [
                        {
                            type: "form__input",
                            props: {
                                id: "form__line__login__input",
                                label: "Логин",
                                props: {
                                    id: "form__line__login__input__input",
                                    placeholder: "Введите логин",
                                    required: true
                                },
                            },
                        },
                    ],
                },
                {
                    id: "form__line_password",
                    components: [
                        {
                            type: "form__input",
                            props: {
                                id: "form__line__password",
                                label: "Пароль",
                                props: {
                                    id: "form__line__password__input",
                                    type: "password",
                                    placeholder: "Введите пароль",
                                    required: true
                                },
                            },
                        },
                    ],
                },
                {
                    id: "form__line_login_button",
                    components: [
                        {
                            type: "button",
                            props: {
                                id: "form__line__login_button",
                                text: "Войти",
                                type: "submit",
                                style: "form__button button_active",
                            },
                        },
                    ],
                    style: "form__line_submit_button",
                },
            ],
        });

        this.#form.render();

        const loginButton = document.getElementById("form__line__login_button");
        loginButton.addEventListener("click", this.#handleLogin.bind(this));
    }

    /**
     * Обработчик логина.
     * @param {Event} event - Объект события.
     */
    #handleLogin(event) {
        event.preventDefault();

        const loginInput = document.querySelector("#form__line_login .form__input input");
        const passwordInput = document.querySelector("#form__line_password .form__input input");

        this.#clearErrors();

        let isValid = true;

        if (!loginInput || !passwordInput) {
            console.error("Не удалось найти поля ввода");
            return;
        }

        if (!loginInput.value.trim()) {
            this.#setError(loginInput, "Поле логин не может быть пустым");
            isValid = false;
        }

        if (!passwordInput.value.trim()) {
            this.#setError(passwordInput, "Поле пароль не может быть пустым");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        userStore
            .login({ login, password })
            .then(() => {
                router.goToPage("home");
            })
            .catch((err) => {
                console.error("Login failed:", err);
            });
    }


    /**
     * Очищает ошибки
     */
    #clearErrors() {
        document.querySelectorAll(".form__input__error").forEach(errorElement => {
            errorElement.textContent = "";
        });
    }

    /**
     * Устанавливает ошибку для поля ввода
     * @param {HTMLInputElement} input - Поле ввода
     * @param {string} message - Текст ошибки
     */
    #setError(input, message) {
        const inputContainer = input.closest(".form__input"); // Находим контейнер поля
        if (!inputContainer) return;

        const errorElement = inputContainer.querySelector(".form__input__error");
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
}
