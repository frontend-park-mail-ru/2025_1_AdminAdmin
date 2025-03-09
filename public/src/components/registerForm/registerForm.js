import { FormInput } from "../form/formInput/formInput.js";
import { Button } from "../button/button.js";
import {Select} from "../select/select.js";
import {userStore} from "../../store/userStore.js";
import {router} from "../../modules/routing.js";
import {ValidateLogin, ValidateName, ValidatePassword} from "../../modules/validation.js";

export default class RegisterForm {
    #parent;
    #config;
    #fNameInput;
    #lNameInput;
    #codeSelect;
    #phoneInput;
    #loginInput
    #passwordInput;
    #repeatPasswordInput;
    #submitBtn;

    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
    }

    get self() {
        return document.getElementById(this.#config.id);
    }

    /**
     * Валидация введенных данных
     */
    validateData = () => {
        const firstName = this.#fNameInput.value.trim();
        const lastName = this.#lNameInput.value.trim();
        const login = this.#loginInput.value.trim();
        const password = this.#passwordInput.value;
        const repeatPassword = this.#repeatPasswordInput.value;

        const validateName = this.#validateName(firstName, lastName);  // Валидация имени и фамилии
        const validateLogin = this.#validateLogin(login);  // Валидация логина
        const validatePassword = this.#validatePassword(password, repeatPassword);  // Валидация пароля

        if (validateName && validateLogin && validatePassword) {
            userStore
                .register({ firstName, lastName, login, password })
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

        if (!validationResult.result){
            this.#loginInput.setError(validationResult.message);
        }

        if (validationResult.result) {
            this.#loginInput.clearError();
        }

        return validationResult.result;
    }

    /**
     * Валидация пароля
     * @returns {boolean}
     */
    #validatePassword(password, repeatPassword){
        const validationResult = ValidatePassword(password);

        if (!validationResult.result){
            this.#passwordInput.setError(validationResult.message);
            this.#repeatPasswordInput.setError(validationResult.message);
            return false;
        }

        if (password !== repeatPassword) {
            this.#passwordInput.setError("Пароли не совпадают");
            this.#repeatPasswordInput.setError("Пароли не совпадают");
            return false;
        }

        if (validationResult.result) {
            this.#passwordInput.clearError();
            this.#repeatPasswordInput.clearError();
        }

        return validationResult.result;
    }

    /**
     * Валидация имени и фамилии
     * @returns {boolean}
     */
    #validateName(firstName, lastName) {
        let firstNameValidationResult = ValidateName(firstName);
        let lastNameValidationResult = ValidateName(lastName, 'surname');

        if (!firstNameValidationResult.result) {
            this.#fNameInput.setError(firstNameValidationResult.message);
        } else {
            this.#fNameInput.clearError();
        }

        if (!lastNameValidationResult.result) {
            this.#lNameInput.setError(lastNameValidationResult.message);
        } else {
            this.#lNameInput.clearError();
        }

        return firstNameValidationResult.result && lastNameValidationResult.result;
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

    render() {
        const template = window.Handlebars.templates["registerForm.hbs"];
        this.#parent.innerHTML =  template(undefined);

        const firstLastNameContainer = document.getElementById("form__line__firstname_lastname");
        const phoneContainer = document.getElementById("form__line__phone");
        const loginContainer = document.getElementById("form__line__register_login");
        const passwordContainer = document.getElementById("form__line__register_password");
        const rPasswordContainer = document.getElementById("form__line__repeat_password");
        const buttonContainer = document.getElementById("form__line_register_button");

        this.#fNameInput = new FormInput(firstLastNameContainer, this.#config.inputs.fName);
        this.#fNameInput.render();

        this.#lNameInput = new FormInput(firstLastNameContainer, this.#config.inputs.lName);
        this.#lNameInput.render();

        this.#codeSelect = new Select(phoneContainer, this.#config.selects.code);
        this.#codeSelect.render();
        this.#phoneInput = new FormInput(phoneContainer, this.#config.inputs.phone)
        this.#phoneInput.render();


        this.#loginInput = new FormInput(loginContainer, this.#config.inputs.login);
        this.#loginInput.render();

        this.#passwordInput = new FormInput(passwordContainer, this.#config.inputs.password);
        this.#passwordInput.render();

        this.#repeatPasswordInput = new FormInput(rPasswordContainer, this.#config.inputs.repeatPassword);
        this.#repeatPasswordInput.render();

        this.#submitBtn = new Button(buttonContainer, {
            ...this.#config.buttons.submitBtn,
            onSubmit: () => {
                this.validateData();
            }
        });
        this.#submitBtn.render();
    }

    remove(){
        this.#submitBtn.remove();
    }
}
