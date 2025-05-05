import template from './formInput.hbs';
import eyeOpen from '@assets/eye.png';
import eyeClosed from '@assets/hide.png';
import debounce from '@modules/debounce';

export interface FormInputProps {
  id: string; // Идентификатор строки ввода
  label?: string; // Название поля (отображается сбоку от поля ввода)
  noErrorInHeader?: boolean; // Ошибка
  placeholder?: string; // Начальное содержимое поля ввода
  type?: string; // Тип поля ввода
  required?: boolean; // true - обязательное поле, false - необязательное
  validator?: (value: string) => { result: boolean; message?: string }; // Функция валидации
  onInput?: (value: string) => void; // Функция при вводе
  min?: number;
  max?: number;
  name?: string;
  autocomplete?: string;
  maxLength?: number;
  movePlaceholderOnInput?: boolean;
  value?: string;
  onEnter?: () => void;
}

export class FormInput {
  private parent: HTMLElement;
  private readonly props: FormInputProps;
  private readonly eyeClickHandler: () => void;
  private readonly debouncedOnInput: (value: string) => void;
  private readonly inputHandler: (e: Event) => void;
  private phoneInputHandler?: (e: Event) => void;

  get self(): HTMLElement | null {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find table`);
    }
    return element as HTMLElement;
  }

  get input(): HTMLInputElement | null {
    return this.self?.querySelector('input');
  }

  private readonly handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' && this.props.onEnter) {
      this.props.onEnter();
    }
  };

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
  }

  beforeInputHandler = (e: InputEvent) => {
    if (this.shouldIgnoreInput(e)) return;

    const newChar = (e.data ?? '').toString();
    const input = this.input;
    if (!input || !newChar) return;

    const currentValue = input.value;
    const newValue = currentValue + newChar;

    if (this.props.type === 'number' && !this.isValidNumberInput(newChar, newValue)) {
      e.preventDefault();
      return;
    }

    if (this.exceedsMaxLength(newValue)) {
      e.preventDefault();
    }
  };

  private shouldIgnoreInput(e: InputEvent): boolean {
    return e.inputType.startsWith('delete');
  }

  private isValidNumberInput(char: string, newValue: string): boolean {
    if (!/^[0-9]$/.test(char)) return false;

    const val = parseInt(newValue, 10);
    if (isNaN(val)) return true;

    if (this.props.min !== undefined && val < this.props.min) return false;
    if (this.props.max !== undefined && val > this.props.max) return false;

    return true;
  }

  private exceedsMaxLength(value: string): boolean {
    return this.props.maxLength !== undefined && value.length > this.props.maxLength;
  }

  private applyPhoneMask() {
    const input = this.input;
    if (input && this.props.type === 'tel') {
      input.value = input.value.replace(/[\s()-]/g, '');
      const digits = input.value.replace(/\D/g, '');
      const match = digits.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      if (match) {
        input.value = !match[2]
          ? match[1]
          : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
      }
    }
  }

  disable(): void {
    const input = this.input;
    if (input) {
      input.disabled = true;
      input.classList.add('disabled');
    }
  }

  render(): void {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    if (!this.props.label && this.props.noErrorInHeader) {
      const inputHeader: HTMLDivElement = this.self.querySelector('.form__input-head');
      inputHeader.style.display = 'none';
    }
    this.setupPhoneMaskIfNeeded();
    this.setupPasswordToggleIfNeeded();
    this.attachInputListeners();
  }

  private setupPhoneMaskIfNeeded(): void {
    if (this.props.type === 'tel' && this.props.value) {
      this.applyPhoneMask();
    }
    if (this.props.type === 'tel') {
      this.addPhoneMask();
    }
  }

  private setupPasswordToggleIfNeeded(): void {
    if (this.props.type !== 'password') return;

    const eyeIcon = this.self?.querySelector('.form__input__eye-icon') as HTMLElement;
    const input = this.input;

    if (eyeIcon && input) {
      eyeIcon.style.display = 'block';
      eyeIcon.addEventListener('click', this.eyeClickHandler);
      input.style.paddingRight = '40px';
    }
  }

  private attachInputListeners(): void {
    const input = this.input;
    if (!input) return;

    if (this.props.type === 'number' || this.props.maxLength !== undefined) {
      input.addEventListener('beforeinput', this.beforeInputHandler);
    }

    input.addEventListener('input', this.inputHandler);

    if (this.props.onEnter) {
      input.addEventListener('keydown', this.handleKeyDown);
    }
  }

  public setOnEnter(callback: () => void): void {
    const input = this.input;
    if (!input) return;

    if (this.props.onEnter) {
      input.removeEventListener('keydown', this.handleKeyDown);
    }

    this.props.onEnter = callback;

    input.addEventListener('keydown', this.handleKeyDown);
  }

  private addPhoneMask(): void {
    this.phoneInputHandler = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (!input) return;
      let cursorPos = input.selectionStart ?? 0;
      const oldLength = input.value.length;
      const digits = input.value.replace(/\D/g, '');
      const match = digits.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      if (match) {
        const formatted = !match[2]
          ? match[1]
          : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
        input.value = formatted;

        const newLength = formatted.length;
        cursorPos += newLength - oldLength;
        input.setSelectionRange(cursorPos, cursorPos);
      }
    };

    this.input?.addEventListener('input', this.phoneInputHandler);
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

  checkValue(): boolean | string {
    const value = this.getTrimmedValue();

    if (this.isOptionalAndEmpty(value)) {
      this.clearError();
      return true;
    }

    if (!this.props.validator) {
      return true;
    }

    const validationResult = this.props.validator(value);

    if (!validationResult.result) {
      if (this.props.noErrorInHeader) {
        return validationResult.message;
      }

      this.setError(validationResult.message || '');
      return false;
    }

    this.clearError();
    return true;
  }

  private getTrimmedValue(): string {
    return this.input?.value.trim() || '';
  }

  private isOptionalAndEmpty(value: string): boolean {
    return !this.props.required && value === '';
  }

  setError(message: string): void {
    const errorEl = this.parent.querySelector(`#${this.props.id}-error`) as HTMLElement;
    if (errorEl) {
      errorEl.textContent = message;
    }
    this.input?.classList.add('error');
  }

  clearError(): void {
    const errorEl = this.parent.querySelector(`#${this.props.id}-error`) as HTMLElement;
    if (errorEl) {
      errorEl.textContent = '';
    }
    this.input?.classList.remove('error');
  }

  get value(): string {
    return this.input?.value || '';
  }

  setValue(value: string): void {
    const input = this.input;
    if (!input) return;

    input.value = value;

    if (this.props.type === 'tel') {
      this.applyPhoneMask();
    }

    this.checkValue();
  }

  setPlaceholder(value: string): void {
    const input = this.input;
    if (!input) return;

    input.placeholder = value;
  }

  remove(): void {
    const input = this.input;
    if (input) {
      input.removeEventListener('input', this.inputHandler);
      input.removeEventListener('beforeinput', this.beforeInputHandler);
    }

    if (this.phoneInputHandler) {
      this.input?.removeEventListener('input', this.phoneInputHandler);
    }

    if (this.props.onEnter) {
      input.removeEventListener('keydown', this.handleKeyDown);
    }

    const eyeIcon = this.self?.querySelector('.form__input__eye-icon') as HTMLElement;
    if (eyeIcon) {
      eyeIcon.removeEventListener('click', this.eyeClickHandler);
    }
  }
}
