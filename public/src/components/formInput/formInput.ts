import template from './formInput.hbs';
import eyeOpen from '@assets/eye.png';
import eyeClosed from '@assets/hide.png';
import debounce from '@modules/debounce';

interface FormInputProps {
  id: string;
  label?: string;
  error?: string;
  placeholder: string;
  type: string;
  validator?: (value: string) => { result: boolean; message?: string };
  onInput?: (value: string) => void;
}

export class FormInput {
  private parent: HTMLElement;
  private readonly eyeClickHandler: () => void;
  private readonly debouncedOnInput: (value: string) => void;
  private readonly props: FormInputProps;

  get self(): HTMLElement | null {
    return document.getElementById(this.props.id);
  }

  get input(): HTMLInputElement | null {
    return this.self?.querySelector('input');
  }

  constructor(parent: HTMLElement, props: FormInputProps) {
    if (!parent) {
      throw new Error('FormInput: no parent!');
    }
    this.parent = parent;
    this.eyeClickHandler = this.handleClick.bind(this);

    this.props = {
      id: props.id,
      label: props.label || '',
      error: props.error || '',
      placeholder: props.placeholder,
      type: props.type,
      validator: props.validator,
      onInput: props.onInput,
    };

    this.debouncedOnInput = debounce(this.onInput.bind(this), 100);
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
      if (eyeIcon) {
        eyeIcon.style.display = 'block';
        eyeIcon.addEventListener('click', this.eyeClickHandler);
        this.input.style.paddingRight = '40px';
      }
    }

    const input = this.input;
    if (input) {
      input.addEventListener('input', (event) =>
        this.debouncedOnInput((event.target as HTMLInputElement).value),
      );
    }
  }

  private handleClick(): void {
    const eyeImg = this.self.querySelector('.eye-icon') as HTMLImageElement;
    const input = this.input;
    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        eyeImg.src = eyeOpen;
        eyeImg.alt = 'eye open';
      } else {
        input.type = 'password';
        eyeImg.src = eyeClosed;
        eyeImg.alt = 'eye closed';
      }
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

  setError(errorMessage: string): void {
    const errorElement = this.parent.querySelector(`#${this.props.id}-error`) as HTMLElement;
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
    this.input?.classList.add('error');
  }

  clearError(): void {
    const errorElement = this.parent.querySelector(`#${this.props.id}-error`) as HTMLElement;
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    this.input?.classList.remove('error');
  }

  get value(): string {
    return this.input?.value || '';
  }

  remove(): void {
    const input = this.input;
    if (input) {
      input.removeEventListener('input', (event) =>
        this.debouncedOnInput((event.target as HTMLInputElement).value),
      );
    }
    const eyeIcon = this.self?.querySelector('.form__input__eye-icon') as HTMLElement;
    if (eyeIcon) {
      eyeIcon.removeEventListener('click', this.eyeClickHandler);
    }
  }
}
