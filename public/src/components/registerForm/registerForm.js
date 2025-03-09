import { FormInput } from "../form/formInput/formInput.js";
import { Button } from "../button/button.js";
import {Select} from "../select/select.js";

export default class RegisterForm {
    #parent;
    #config;
    #fNameInput;
    #lNameInput;
    #codeSelect;
    #phoneInput;
    #loginInput
    #passwordInput;
    #rPasswordInput;
    #submitBtn;

    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
    }

    get self() {
        return document.getElementById(this.#config.id);
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

        this.#rPasswordInput = new FormInput(rPasswordContainer, this.#config.inputs.repeatPassword);
        this.#rPasswordInput.render();

        this.#submitBtn = new Button(buttonContainer, this.#config.buttons.submitBtn, this.validateData);
        this.#submitBtn.render();
    }

}
