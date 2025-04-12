import { FormInput } from '../formInput/formInput';
import { Button } from '../button/button';

import template from './profileForm.hbs';
import { ProfileFormConfig } from './profileFormConfig';

/**
 * Класс формы редактирования данных профиля
 */
export class ProfileForm {
  private parent: HTMLElement; // Родительский элемент
  private config: ProfileFormConfig; // "Конфиг" формы, содержит пропсы всех компонентов формы
  private components: {
    // Словарь компонентов
    formInput: {
      firstName: FormInput;
      secondName: FormInput;
      phoneNumber: FormInput;
      password: FormInput;
      repeatPassword: FormInput;
    };
    submitButton: Button;
  };

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
  get self(): HTMLElement | null {
    //return document.getElementById(this.config.id);
    const element = document.getElementById(this.config.id);
    if (!element) {
      throw new Error(`ProfileForm: can't find profileForm with id=${this.config.id}`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Валидация данных
   */
  async validateData() {
    // Проверяем что все данные валидны, иначе возвращаем void
    for (const formInputComponent of Object.values(this.components.formInput)) {
      if (!formInputComponent.checkValue()) {
        return;
      }
    }
    return; // Временный ретурн, пока не знаю что делать
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
   * Рендеринг формы
   */
  render() {
    if (!template) {
      throw new Error('Error: profile-form template not found');
    }
    this.parent.innerHTML = template();
    const containers = {
      formInput: {
        firstName: document.getElementById('profile-edit-form__first-name'),
        secondName: document.getElementById('profile-edit-form__second-name'),
        phoneNumber: document.getElementById('profile-edit-form__phone-number'),
        password: document.getElementById('profile-edit-form__password'),
        repeatPassword: document.getElementById('profile-edit-form__repeat-password'),
      },
      submitButton: document.getElementById('profile-edit-form__submit-button'),
    };
    Object.entries(containers).map(([key, value]) => {
      if (!value) {
        throw new Error(`ProfileForm: container for "${key}" not found`);
      }
    });
    this.components = {
      formInput: {
        firstName: new FormInput(containers.formInput.firstName, this.config.inputs.firstName),
        secondName: new FormInput(containers.formInput.secondName, this.config.inputs.secondName),
        phoneNumber: new FormInput(
          containers.formInput.phoneNumber,
          this.config.inputs.phoneNumber,
        ),
        password: new FormInput(containers.formInput.password, this.config.inputs.password),
        repeatPassword: new FormInput(
          containers.formInput.repeatPassword,
          this.config.inputs.repeatPassword,
        ),
      },
      submitButton: new Button(containers.submitButton, {
        ...this.config.buttons.submitButton,
        onSubmit: () => {
          this.validateData();
        },
      }),
    };
    this.components.formInput.firstName.render();
    this.components.formInput.secondName.render();
    this.components.formInput.phoneNumber.render();
    this.components.formInput.password.render();
    this.components.formInput.repeatPassword.render();
    this.components.submitButton.render();
  }

  /**
   * Очистка
   */
  remove() {
    this.components.formInput.firstName.remove();
    this.components.formInput.secondName.remove();
    this.components.formInput.phoneNumber.remove();
    this.components.formInput.password.remove();
    this.components.formInput.repeatPassword.remove();
    this.components.submitButton.remove();
  }
}
