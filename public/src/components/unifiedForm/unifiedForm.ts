import { FormInput } from '@components/formInput/formInput';
import { Button } from '@components/button/button';
import { Select } from '@components/select/select';
import { userStore } from '@store/userStore';
import { toasts } from '@modules/toasts';
import template from './unifiedForm.hbs';
import { getFormConfig, I_FormConfig } from './unifiedFormConfig';

export default class UnifiedForm {
  private readonly parent: HTMLElement;
  private readonly isEditMode: boolean;
  private readonly config: any;
  private components: {
    inputs: Record<string, FormInput>;
    submitButton: Button;
    codeSelect?: Select;
  };

  constructor(parent: HTMLElement, isEditMode: boolean) {
    this.parent = parent;
    this.isEditMode = isEditMode;
    this.config = getFormConfig(isEditMode);
    this.components = { inputs: {}, submitButton: null };
  }

  get self(): HTMLElement {
    return document.getElementById(this.config.id) as HTMLElement;
  }

  async validateData() {
    for (const formInputComponent of Object.values(this.components.inputs)) {
      if (!formInputComponent.checkValue()) {
        return;
      }
    }

    const userData = {
      first_name: this.components.inputs.firstName.value.trim(),
      last_name: this.components.inputs.secondName.value.trim(),
      phone_number:
        this.components.codeSelect.value +
        this.components.inputs.phoneNumber.value.trim().replace(/[\s()-]/g, ''),
      login: this.components.inputs.login ? this.components.inputs.login.value.trim() : null,
      password: this.components.inputs.password.value,
    };

    try {
      if (this.isEditMode) {
        // Вставить логику обновления профиля
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

    if (formConfig.selects) {
      const codeSelectContainer = document.getElementById('form__line__phoneNumber');
      if (codeSelectContainer) {
        this.components.codeSelect = new Select(codeSelectContainer, formConfig.selects.code);
        this.components.codeSelect.render();
      }
    }

    for (const [key, config] of Object.entries(formConfig.inputs)) {
      const container = document.getElementById(`form__line__${key}`);
      if (container) {
        const inputComponent = new FormInput(container, config);
        inputComponent.render();
        this.components.inputs[key] = inputComponent;
      }
    }

    const submitButtonContainer = document.getElementById('form__line__submitButton');
    if (submitButtonContainer) {
      this.components.submitButton = new Button(submitButtonContainer, {
        ...formConfig.buttons.submitButton,
        onSubmit: () => this.validateData(),
      });
      this.components.submitButton.render();
    }
  }

  remove() {
    Object.values(this.components.inputs).forEach((input) => input.remove());
    this.components.submitButton.remove();
    if (this.components.codeSelect) {
      this.components.codeSelect.remove();
    }
  }
}
