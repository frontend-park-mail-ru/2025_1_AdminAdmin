import { FormInput } from 'doordashers-ui-kit';
import { Button } from 'doordashers-ui-kit';
import { Select } from '@components/select/select';
import { userStore } from '@store/userStore';
import { toasts } from 'doordashers-ui-kit';
import template from './unifiedForm.hbs';
import { getFormConfig, I_FormConfig } from './unifiedFormConfig';
import { UpdateUserPayload, User } from '@myTypes/userTypes';

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
    this.components.submitButton.disable();
    this.clearError();

    if (!this.validateInputs()) {
      this.components.submitButton.enable();
      return;
    }

    const userData = this.collectUserData();
    if (!this.validatePasswords(userData)) {
      this.components.submitButton.enable();
      return;
    }

    try {
      await this.handleRequest(userData);
    } catch (err) {
      const errorMessage = err.message || 'Непредвиденная ошибка';
      this.setError(errorMessage);
      toasts.error(errorMessage);
      this.components.submitButton.enable();
    } finally {
      if (this.isEditMode) this.components.submitButton.enable();
    }
  }

  get inputs(): Record<string, FormInput> {
    return this.components.inputs;
  }

  private async handleRequest(userData: any) {
    if (this.isEditMode) {
      await this.updateUser(userData);
    } else {
      await userStore.register(userData);
      toasts.success('Вы успешно зарегистрировались!');
    }
  }

  private validateInputs(): boolean {
    return Object.values(this.components.inputs).every((input) => input.checkValue());
  }

  collectUserData(): Omit<User, 'active_address' | 'has_secret' | 'path' | 'id' | 'description'> & {
    password: string;
  } {
    return {
      first_name: this.components.inputs.first_name.value.trim(),
      last_name: this.components.inputs.last_name.value.trim(),
      phone_number:
        this.components.codeSelect.value +
        this.components.inputs.phone_number.value.trim().replace(/[\s()-]/g, ''),
      login: this.components.inputs.login?.value.trim() || null,
      password: this.components.inputs.password.value,
    };
  }

  private validatePasswords(userData: any): boolean {
    if (userData.password && userData.password !== this.components.inputs.repeatPassword.value) {
      this.setError('Пароли не совпадают');
      toasts.error('Пароли не совпадают');
      return false;
    }
    return true;
  }

  private async updateUser(userData: any) {
    const payload: Partial<UpdateUserPayload> = {};
    for (const key in userData) {
      const value = userData[key];
      if (value) {
        (payload as any)[key] = value;
      }
    }
    try {
      await userStore.updateUser(payload);
      toasts.success('Ваш профиль успешно обновлен!');
    } catch (error) {
      toasts.error(error.message);
    }
  }

  setError(errorMessage: string) {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = errorMessage;
    }
  }

  clearError() {
    const errorElement = this.parent.querySelector('.form__error') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  render() {
    this.parent.innerHTML = template();

    const formConfig: I_FormConfig = this.config;

    // Контейнер для "Имя + Фамилия"
    const nameContainer = document.createElement('div');
    nameContainer.className = 'form__line';
    nameContainer.id = 'name_container';
    this.parent.appendChild(nameContainer);

    const firstNameInput = new FormInput(nameContainer, formConfig.inputs.first_name);
    firstNameInput.render();
    this.components.inputs.first_name = firstNameInput;

    const secondNameInput = new FormInput(nameContainer, formConfig.inputs.last_name);
    secondNameInput.render();
    this.components.inputs.last_name = secondNameInput;

    const phoneContainer = document.createElement('div');
    phoneContainer.className = 'form__line';
    this.parent.appendChild(phoneContainer);

    this.components.codeSelect = new Select(phoneContainer, formConfig.selects.code);
    this.components.codeSelect.render();

    const phoneInput = new FormInput(phoneContainer, formConfig.inputs.phone_number);
    phoneInput.render();
    this.components.inputs.phone_number = phoneInput;

    for (const [key, config] of Object.entries(formConfig.inputs)) {
      if (key === 'first_name' || key === 'last_name' || key === 'phone_number') {
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
        await this.validateData();
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
