import template from './formInput.hbs';
import eyeOpen from '@assets/eye.png';
import eyeClosed from '@assets/hide.png';
import debounce from '@modules/debounce';

export interface FormInputProps {
  id: string; // Идентификатор строки ввода
  label?: string; // Название поля (отображается сбоку от поля ввода)
  error?: string; // Ошибка
  placeholder?: string; // Начальное содержимое поля ввода
  type?: string; // Тип поля ввода
  required?: boolean; // true - обязательное поле, false - необязательное
  validator?: (value: string) => { result: boolean; message?: string }; // Функция валидации
  onInput?: (value: string) => void; // Функция при вводе
  min?: number;
  max?: number;
  maxLength?: number;
  movePlaceholderOnInput?: boolean;
}

export class FormInput {
  private parent: HTMLElement;
  private readonly props: FormInputProps;
  private readonly eyeClickHandler: () => void;
  private readonly debouncedOnInput: (value: string) => void;
  private readonly inputHandler: (e: Event) => void;
  private readonly beforeInputHandler: (e: InputEvent) => void;

  get self(): HTMLElement | null {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find table`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  get input(): HTMLInputElement | null {
    return this.self?.querySelector('input');
  }

  constructor(parent: HTMLElement, props: FormInputProps) {
    if (!parent) {
      throw new Error('FormInput: no parent!');
    }
    if (document.getElementById(props.id)) {
      throw new Error('FormInput: this id is already used!');
    }
    this.parent = parent;
    this.props = props;

    this.eyeClickHandler = this.handleClick.bind(this);
    this.debouncedOnInput = debounce(this.onInput.bind(this), 100);

    this.inputHandler = (e: Event) => this.debouncedOnInput((e.target as HTMLInputElement).value);

    this.beforeInputHandler = (e: InputEvent) => {
      if (e.inputType.startsWith('delete')) return;

      const newChar = (e.data ?? '').toString();
      const input = this.input;
      if (!input) return;

      const currentValue = input.value;
      const newValue = currentValue + newChar;

      if (this.props.type === 'number') {
        if (!/^[0-9]$/.test(newChar)) {
          e.preventDefault();
          return;
        }

        const val = parseInt(newValue, 10);
        if (!isNaN(val)) {
          if (this.props.min !== undefined && val < this.props.min) {
            e.preventDefault();
            return;
          }
          if (this.props.max !== undefined && val > this.props.max) {
            e.preventDefault();
            return;
          }
        }
      }

      if (this.props.maxLength !== undefined && newValue.length > this.props.maxLength) {
        e.preventDefault();
      }
    };
  }

  render(): void {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    if (!this.props.label) {
      const labelElement: HTMLElement = this.self?.querySelector('.form__input-head');
      if (labelElement) labelElement.remove();
    }

    if (!this.props.error) {
      const errorElement: HTMLElement = this.self?.querySelector('.form__error');
      if (errorElement) errorElement.style.display = 'none';
    }

    if (this.props.type === 'password') {
      const eyeIcon = this.self?.querySelector('.form__input__eye-icon') as HTMLElement;
      const input = this.input;
      if (eyeIcon && input) {
        eyeIcon.style.display = 'block';
        eyeIcon.addEventListener('click', this.eyeClickHandler);
        input.style.paddingRight = '40px';
      }
    }

    const input = this.input;
    if (input) {
      if (this.props.type === 'number' || this.props.maxLength !== undefined) {
        input.addEventListener('beforeinput', this.beforeInputHandler);
      }

      input.addEventListener('input', this.inputHandler);
    }
  }

  private handleClick(): void {
    const eyeImg = this.self?.querySelector('.eye-icon') as HTMLImageElement;
    const input = this.input;
    if (input && eyeImg) {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      eyeImg.src = isPassword ? eyeOpen : eyeClosed;
      eyeImg.alt = isPassword ? 'eye open' : 'eye closed';
    }
  }

  private onInput(): void {
    const value = this.input?.value.trim() || '';
    this.props.onInput?.(value);
    this.checkValue();
  }

  checkValue(): boolean {
    const value = this.input?.value.trim() || '';
    if (!this.props.validator) {
      return true;
    }
    const validationResult = this.props.validator(value);
    if (!validationResult.result) {
      this.setError(validationResult.message || '');
    } else {
      this.clearError();
    }
    return validationResult.result;
  }

  setError(message: string): void {
    const errorEl = this.parent.querySelector(`#${this.props.id}-error`) as HTMLElement;
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    this.input?.classList.add('error');
  }

  clearError(): void {
    const errorEl = this.parent.querySelector(`#${this.props.id}-error`) as HTMLElement;
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
    this.input?.classList.remove('error');
  }

  get value(): string {
    return this.input?.value || '';
  }

  remove(): void {
    const input = this.input;
    if (input) {
      input.removeEventListener('input', this.inputHandler);
      input.removeEventListener('beforeinput', this.beforeInputHandler);
    }

    const eyeIcon = this.self?.querySelector('.form__input__eye-icon') as HTMLElement;
    if (eyeIcon) {
      eyeIcon.removeEventListener('click', this.eyeClickHandler);
    }
  }
}
