import { Form } from "../form/form.js";
import { router } from "../../modules/routing.js";
import { userStore } from "../../store/userStore.js";

/**
 * Класс, представляющий форму регистрации.
 */
export default class RegisterForm {
    #parent;
    #form;

    /**
     * Создает экземпляр формы регистрации.
     * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться форма.
     */
    constructor(parent) {
        this.#parent = parent;
    }

    /**
     * Рендерит форму регистрации.
     */
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
                        style: "form__button button_active",
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
                        style: "form__button button_inactive",
                    },
                },
            ],
            lines: [
                {
                    id: "form__line_firstname_lastname",
                    components: [
                        {
                            type: "form__input",
                            props: {
                                id: "form__line__firstname",
                                label: "Имя",
                                props: { id: "form__line__firstname__input", placeholder: "Введите имя", required: true },
                            },
                        },
                        {
                            type: "form__input",
                            props: {
                                id: "form__line__lastname",
                                label: "Фамилия",
                                props: { id: "form__line__lastname__input", placeholder: "Введите фамилию", required: true },
                            },
                        },
                    ],
                },
                {
                    id: "form__line_phone",
                    components: [
                        {
                            type: "form__select",
                            props: {
                                id: "form__line__phone_code",
                                label: "Код страны",
                                options: [
                                    {value: "RU", text: "Россия (+7)"},
                                    {value: "BY", text: "Беларусь (+375)"},
                                    {value: "KZ", text: "Казахстан (+7)"},
                                    {value: "AM", text: "Армения (+374)"},
                                    {value: "KG", text: "Кыргызстан (+996)"},
                                    {value: "MD", text: "Молдова (+373)"},
                                    {value: "TJ", text: "Таджикистан (+992)"},
                                    {value: "UZ", text: "Узбекистан (+998)"},
                                    {value: "AZ", text: "Азербайджан (+994)"},
                                    {value: "TM", text: "Туркменистан (+993)"},
                                ],
                                required: true,
                            },
                        },
                        {
                            type: "form__input",
                            props: {
                                id: "form__line__phone",
                                label: "Телефон",
                                props: { id: "form__line__phone__input", placeholder: "Введите телефон", required: true },
                            },
                        },
                    ],
                },
                {
                    id: "form__line_login",
                    components: [
                        {
                            type: "form__input",
                            props: {
                                id: "form__line__login",
                                label: "Логин",
                                props: { id: "form__line__login__input", placeholder: "Введите логин", required: true },
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
                                props: { id: "form__line__password__input", type: "password", placeholder: "Введите пароль (Не менее 10 символов)", required: true },
                            },
                        },
                    ],
                },
                {
                    id: "form__line_register_button",
                    components: [
                        {
                            type: "button",
                            props: {
                                id: "form__line__register_button",
                                text: "Зарегистрироваться",
                                onSubmit: this.#handleRegister,
                                style: "form__button button_active",
                            },
                        },
                    ],
                    style: "form__line_submit_button",
                },
            ],
        });
        this.#form.render();
    }

    /**
     * Обработчик регистрации.
     */
    #handleRegister() {
        const loginInput = document.getElementById("form__line__login__input").value.trim();
        const passwordInput = document.getElementById("form__line__password__input").value.trim();
        userStore
            .register({ login: loginInput, password: passwordInput })
            .then(() => {
                router.goToPage("home");
            })
            .catch((err) => {
                console.error("Register failed:", err);
            });
    }
}