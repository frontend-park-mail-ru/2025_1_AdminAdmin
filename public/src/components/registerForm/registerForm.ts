import { FormInput } from '../formInput/formInput';
import { Button } from '../button/button';
import { Select } from '../select/select';
import { userStore } from '../../store/userStore';
import { router } from '../../modules/routing';
import template from './registerForm.hbs';

/**
 * Класс, представляющий форму регистрации
 */
export default class RegisterForm {
  private parent: HTMLElement;
  private config: any;
  private fNameInput: FormInput;
  private lNameInput: FormInput;
  private codeSelect: Select;
  private phoneInput: FormInput;
  private loginInput: FormInput;
  private passwordInput: FormInput;
  private repeatPasswordInput: FormInput;
  private submitBtn: Button;
  private phoneInputHandler?: (e: Event) => void;

  /**
   * Конструктор класса
   * @constructor
   * @param parent {HTMLElement} - родительский элемент
   * @param config {Object} - пропсы
   */
  constructor(parent: HTMLElement, config: any) {
    this.parent = parent;
    this.config = config;
  }

  /**
   * Получение HTML элемента формы
   * @returns {HTMLElement}
   */
  get self(): HTMLElement {
    return document.getElementById(this.config.id) as HTMLElement;
  }

  /**
   * Валидация введенных данных
   */
  async validateData() {
    const isFNameValid = this.fNameInput.checkValue();
    const isLNameValid = this.lNameInput.checkValue();
    const isPhoneValid = this.phoneInput.checkValue();
    const isLoginValid = this.loginInput.checkValue();
    const isPasswordValid = this.passwordInput.checkValue();
    const isRepeatPasswordValid = this.repeatPasswordInput.value === this.passwordInput.value;

    if (
      !(
        isFNameValid &&
        isLNameValid &&
        isPhoneValid &&
        isLoginValid &&
        isPasswordValid &&
        isRepeatPasswordValid
      )
    ) {
      return;
    }

    const firstName = this.fNameInput.value.trim();
    const lastName = this.lNameInput.value.trim();
    const code = this.codeSelect.value;
    const phone = this.phoneInput.value.trim().replace(/[\s()-]/g, '');
    const phoneNumber = code + phone;
    const login = this.loginInput.value.trim();
    const password = this.passwordInput.value;

    try {
      await userStore.register({ firstName, lastName, phoneNumber, login, password });
      router.goToPage('home');
    } catch (err) {
      const errorMessage = err?.message || 'Непредвиденная ошибка';
      this.setError(errorMessage);
    }
  }

  /**
   * Отображает ошибку
   * @param {String} errorMessage - сообщение ошибки
   */
  setError(errorMessage: string) {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;

    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Очистка ошибки
   */
  clearError() {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * Добавляет маску для ввода номера телефона в формате (XXX) XXX-XXXX.
   */
  addPhoneMask() {
    this.phoneInputHandler = (e: Event) => {
      const input = e.target as HTMLInputElement;
      let cursorPos = input.selectionStart!;
      const oldLength = input.value.length;
      const digits = input.value.replace(/\D/g, '');
      const match = digits.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      const formatted = !match![2]
        ? match![1]
        : `(${match![1]}) ${match![2]}${match![3] ? `-${match![3]}` : ''}`;
      input.value = formatted;

      const newLength = formatted.length;
      cursorPos += newLength - oldLength;
      input.setSelectionRange(cursorPos, cursorPos);
    };

    this.phoneInput.input.addEventListener('input', this.phoneInputHandler);
  }

  /**
   * Удаляет маску с поля ввода номера телефона.
   */
  removePhoneMask() {
    if (this.phoneInputHandler) {
      this.phoneInput.input.removeEventListener('input', this.phoneInputHandler);
    }
  }

  /**
   * Очистка
   */
  remove() {
    this.removePhoneMask();
    this.fNameInput.remove();
    this.lNameInput.remove();
    this.phoneInput.remove();
    this.loginInput.remove();
    this.passwordInput.remove();
    this.repeatPasswordInput.remove();
    this.submitBtn.remove();
  }

  /**
   * Рендеринг формы
   */
  render() {
    this.parent.innerHTML = template(undefined);

    const firstLastNameContainer = document.getElementById('form__line__firstname_lastname')!;
    const phoneContainer = document.getElementById('form__line__phone')!;
    const loginContainer = document.getElementById('form__line__register_login')!;
    const passwordContainer = document.getElementById('form__line__register_password')!;
    const rPasswordContainer = document.getElementById('form__line__repeat_password')!;
    const buttonContainer = document.getElementById('form__line_register_button')!;

    this.fNameInput = new FormInput(firstLastNameContainer, this.config.inputs.fName);
    this.fNameInput.render();

    this.lNameInput = new FormInput(firstLastNameContainer, this.config.inputs.lName);
    this.lNameInput.render();

    this.codeSelect = new Select(phoneContainer, this.config.selects.code);
    this.codeSelect.render();
    this.phoneInput = new FormInput(phoneContainer, this.config.inputs.phone);
    this.phoneInput.render();

    this.addPhoneMask();

    this.loginInput = new FormInput(loginContainer, this.config.inputs.login);
    this.loginInput.render();

    this.passwordInput = new FormInput(passwordContainer, this.config.inputs.password);
    this.passwordInput.render();

    this.repeatPasswordInput = new FormInput(rPasswordContainer, this.config.inputs.repeatPassword);
    this.repeatPasswordInput.render();

    this.submitBtn = new Button(buttonContainer, {
      ...this.config.buttons.submitBtn,
      onSubmit: () => {
        this.validateData();
      },
    });
    this.submitBtn.render();
  }
}
