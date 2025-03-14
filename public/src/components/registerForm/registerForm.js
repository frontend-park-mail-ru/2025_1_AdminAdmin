import { FormInput } from '../formInput/formInput.js';
import { Button } from '../button/button.js';
import { Select } from '../select/select.js';
import { userStore } from '../../store/userStore.js';
import { router } from '../../modules/routing.js';
import {
  ValidateLogin,
  ValidateName,
  ValidatePassword,
  ValidatePhone,
} from '../../modules/validation.js';

/**
 * Класс, представляющий форму регистрации
 */
export default class RegisterForm {
  #parent;
  #config;
  #fNameInput;
  #lNameInput;
  #codeSelect;
  #phoneInput;
  #loginInput;
  #passwordInput;
  #repeatPasswordInput;
  #submitBtn;
  #phoneInputHandler;

  /**
   * Конструктор класса
   * @constructor
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
  get self() {
    return document.getElementById(this.#config.id);
  }

  /**
   * Валидация введенных данных
   */
  validateData = () => {
    const firstName = this.#fNameInput.value.trim();
    const lastName = this.#lNameInput.value.trim();
    const code = this.#codeSelect.value;

    const phone = this.#phoneInput.value.trim();
    const cleanedPhone = phone.replace(/[\s()-]/g, '');
    const phoneNumber = code + cleanedPhone;

    const login = this.#loginInput.value.trim();
    const password = this.#passwordInput.value;
    const repeatPassword = this.#repeatPasswordInput.value;

    const validateName = this.#validateName(firstName, lastName);
    const validatePhone = this.#validatePhone(phoneNumber);
    const validateLogin = this.#validateLogin(login);
    const validatePassword = this.#validatePassword(password, repeatPassword);

    if (validateName && validatePhone && validateLogin && validatePassword) {
      userStore
        .register({ firstName, lastName, phoneNumber, login, password })
        .then(() => {
          router.goToPage('home');
        })
        .catch((err) => {
          const errorMessage = err ? err : 'Непредвиденная ошибка';
          this.setError(errorMessage);
        });
    }
  };

  /**
   * Валидация логина
   * @returns {boolean}
   */
  #validateLogin(login) {
    const validationResult = ValidateLogin(login);

    if (!validationResult.result) {
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
  #validatePassword(password, repeatPassword) {
    const validationResult = ValidatePassword(password);

    if (!validationResult.result) {
      this.#passwordInput.setError(validationResult.message);
      this.#repeatPasswordInput.setError(validationResult.message);
      return false;
    }

    if (password !== repeatPassword) {
      this.#passwordInput.setError('Пароли не совпадают');
      this.#repeatPasswordInput.setError('Пароли не совпадают');
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
    let lastNameValidationResult = ValidateName(lastName);

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

  /**
   * Валидация телефона
   * @returns {boolean}
   */
  #validatePhone(phoneNumber) {
    const validationResult = ValidatePhone(phoneNumber);

    if (!validationResult.result) {
      this.#phoneInput.setError(validationResult.message);
    }

    if (validationResult.result) {
      this.#phoneInput.clearError();
    }

    return validationResult.result;
  }

  /**
   * Отображает ошибку
   * @param {String} errorMessage - сообщение ошибки
   */
  setError(errorMessage) {
    const errorElement = this.#parent.querySelector('.form__error');

    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Очистка ошибки
   */
  clearError() {
    const errorElement = this.#parent.querySelector('.form__error');

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * Добавляет маску для ввода номера телефона в формате (XXX) XXX-XXXX.
   */
  addPhoneMask() {
    this.#phoneInputHandler = (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    };

    this.#phoneInput.input.addEventListener('input', this.#phoneInputHandler);
  }

  /**
   * Удаляет маску с поля ввода номера телефона.
   */
  removePhoneMask() {
    if (this.#phoneInputHandler) {
      this.#phoneInput.input.removeEventListener('input', this.#phoneInputHandler);
    }
  }

  /**
   * Очистка
   */
  remove() {
    this.removePhoneMask();
    this.#submitBtn.remove();
  }

  /**
   * Рендеринг формы
   */
  render() {
    const template = window.Handlebars.templates['registerForm.hbs'];
    this.#parent.innerHTML = template(undefined);

    const firstLastNameContainer = document.getElementById('form__line__firstname_lastname');
    const phoneContainer = document.getElementById('form__line__phone');
    const loginContainer = document.getElementById('form__line__register_login');
    const passwordContainer = document.getElementById('form__line__register_password');
    const rPasswordContainer = document.getElementById('form__line__repeat_password');
    const buttonContainer = document.getElementById('form__line_register_button');

    this.#fNameInput = new FormInput(firstLastNameContainer, this.#config.inputs.fName);
    this.#fNameInput.render();

    this.#lNameInput = new FormInput(firstLastNameContainer, this.#config.inputs.lName);
    this.#lNameInput.render();

    this.#codeSelect = new Select(phoneContainer, this.#config.selects.code);
    this.#codeSelect.render();
    this.#phoneInput = new FormInput(phoneContainer, this.#config.inputs.phone);
    this.#phoneInput.render();

    this.addPhoneMask();

    this.#loginInput = new FormInput(loginContainer, this.#config.inputs.login);
    this.#loginInput.render();

    this.#passwordInput = new FormInput(passwordContainer, this.#config.inputs.password);
    this.#passwordInput.render();

    this.#repeatPasswordInput = new FormInput(
      rPasswordContainer,
      this.#config.inputs.repeatPassword,
    );
    this.#repeatPasswordInput.render();

    this.#submitBtn = new Button(buttonContainer, {
      ...this.#config.buttons.submitBtn,
      onSubmit: () => {
        this.validateData();
      },
    });
    this.#submitBtn.render();
  }
}
