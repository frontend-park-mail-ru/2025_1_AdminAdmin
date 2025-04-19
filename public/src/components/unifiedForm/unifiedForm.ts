import { FormInput } from '@components/formInput/formInput';
import { Button } from '@components/button/button';
import { Select } from '@components/select/select';
import { userStore } from '@store/userStore';
import { toasts } from '@modules/toasts';
import template from './unifiedForm.hbs';
import { getFormConfig, I_FormConfig } from './unifiedFormConfig';
import { UpdateUserPayload } from '@myTypes/userTypes';

// Класс компонента универсальной формы
export default class UnifiedForm {
  private readonly parent: HTMLElement;
  private readonly isEditMode: boolean; // Форма редактирования (профиль)
  private readonly config: I_FormConfig;
  private components: {
    // Список компонентов
    inputs: Record<string, FormInput>;

    submitButton: Button;
    loadAvatarButton: Button;
    codeSelect?: Select;
  };

  constructor(parent: HTMLElement, isEditMode: boolean) {
    this.parent = parent;
    this.isEditMode = isEditMode;
    this.config = getFormConfig(isEditMode);
    this.components = { inputs: {}, submitButton: null, loadAvatarButton: null };
  }

  async validateData() {
    this.clearError();
    // Валидация полей
    for (const formInputComponent of Object.values(this.components.inputs)) {
      if (!formInputComponent.checkValue()) {
        return;
      }
    }
    // Задаем компоненты полей ввода
    const userData: any = {
      first_name: this.components.inputs.firstName.value.trim(),
      last_name: this.components.inputs.secondName.value.trim(),
      phone_number:
        this.components.codeSelect.value +
        this.components.inputs.phoneNumber.value.trim().replace(/[\s()-]/g, ''),
      login: this.components.inputs.login ? this.components.inputs.login.value.trim() : null,
      password: this.components.inputs.password.value,
    };
    // Проверка на совпадение паролей
    if (userData.password && userData.password !== this.components.inputs.repeatPassword.value) {
      this.setError('Пароли не совпадают');
      toasts.error('Пароли не совпадают');
      return;
    }
    //
    if (this.components.inputs.repeatPassword) {
      delete userData.repeatPassword;
    }

    try {
      if (this.isEditMode) {
        // Форма редактирования (профиль)
        const updateUserPayload: Partial<UpdateUserPayload> = {};
        for (const key in userData) {
          const value = userData[key];
          if (value) {
            (updateUserPayload as any)[key] = value;
          }
        }
        await userStore.updateUser(updateUserPayload);
        toasts.success('Ваш профиль успешно обновлен!');
      } else {
        await userStore.register(userData);
        toasts.success('Вы успешно зарегистрировались!');
      }
    } catch (err) {
      const errorMessage = err?.message || 'Непредвиденная ошибка';
      this.setError(errorMessage);
      toasts.error(errorMessage);
    }
  }

  setError(errorMessage: string) {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
  }

  clearError() {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  render() {
    this.parent.innerHTML = template();

    const formConfig: I_FormConfig = this.config;

    // Контейнер для "Имя + Фамилия"
    const nameContainer = document.createElement('div');
    nameContainer.className = 'form__line';
    this.parent.appendChild(nameContainer);

    const firstNameInput = new FormInput(nameContainer, formConfig.inputs.firstName);
    firstNameInput.render();
    this.components.inputs.firstName = firstNameInput;

    const secondNameInput = new FormInput(nameContainer, formConfig.inputs.secondName);
    secondNameInput.render();
    this.components.inputs.secondName = secondNameInput;

    const phoneContainer = document.createElement('div');
    phoneContainer.className = 'form__line';
    this.parent.appendChild(phoneContainer);

    this.components.codeSelect = new Select(phoneContainer, formConfig.selects.code);
    this.components.codeSelect.render();

    const phoneInput = new FormInput(phoneContainer, formConfig.inputs.phoneNumber);
    phoneInput.render();
    this.components.inputs.phoneNumber = phoneInput;

    for (const [key, config] of Object.entries(formConfig.inputs)) {
      if (key === 'firstName' || key === 'secondName' || key === 'phoneNumber') {
        continue;
      }

      const lineWrapper = document.createElement('div');
      lineWrapper.className = 'form__line';
      lineWrapper.id = `form__line__${key}`;
      this.parent.appendChild(lineWrapper);

      const inputComponent = new FormInput(lineWrapper, config);
      inputComponent.render();
      this.components.inputs[key] = inputComponent;
    }

    const submitButtonContainer = document.createElement('div');
    submitButtonContainer.className = 'form__line form__line_submit_button';
    this.parent.appendChild(submitButtonContainer);

    this.components.submitButton = new Button(submitButtonContainer, {
      ...formConfig.buttons.submitButton,
      onSubmit: async () => {
        this.components.submitButton.disable();
        try {
          await this.validateData();
        } catch {
          this.components.submitButton.enable();
        } finally {
          if (this.isEditMode) {
            this.components.submitButton.enable();
          }
        }
      },
    });
    this.components.submitButton.render();
  }

  remove() {
    Object.values(this.components.inputs).forEach((input) => input.remove());
    this.components.submitButton.remove();
    if (this.components.codeSelect) {
      this.components.codeSelect.remove();
    }
  }
}
