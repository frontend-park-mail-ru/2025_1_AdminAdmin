import template from './formInput.hbs';

export interface FormInputProps {
  id: string; // Идентификатор строки ввода
  label: string; // Название поля (отображается сбоку от поля ввода)
  error?: string; // Ошибка
  placeholder?: string; // Начальное содержимое поля ввода
  type?: string; // Тип поля ввода
  required?: boolean; // true - обязательное поле, false - необязательное
  validator?: (value: string) => { result: boolean; message?: string }; // Функция валидации
  onInput?: (value: string) => void; // Функция при вводе
}

export class FormInput {
  private parent: HTMLElement;
  private readonly inputHandler: () => void;
  private readonly eyeClickHandler: () => void;
  private readonly props: FormInputProps;

  get self(): HTMLElement | null {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find table`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
    // return document.getElementById(this.props.id);
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
    console.log(`Зашли в конструктор formInput`);
    this.parent = parent;
    this.inputHandler = this.handleInput.bind(this);
    this.eyeClickHandler = this.handleClick.bind(this);
    console.log(`Начинаем задвать пропсы`);
    this.props = {
      id: props.id,
      label: props.label || '',
      error: props.error || '',
      placeholder: props.placeholder,
      type: props.type || 'text',
      required: props.required ?? false,
      validator: props.validator,
      onInput: props.onInput,
    };
    console.log(`Задали пропсы: ${JSON.stringify(this.props)}`);
  }

  render(): void {
    console.log(`Рендерим шаблончик`);
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    console.log(`Проверка: нет label`);
    if (!this.props.label) {
      const labelElement: HTMLElement = this.self?.querySelector('.form__input-head');
      if (labelElement) labelElement.remove();
    }
    console.log(`Проверка: нет error`);
    if (!this.props.error) {
      const errorElement: HTMLElement = this.self?.querySelector('.form__error');
      if (errorElement) errorElement.style.display = 'none';
    }
    console.log(`Проверка: пароль`);
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
      input.addEventListener('input', this.inputHandler);
    }
  }

  private handleClick(): void {
    const eyeImg = this.self.querySelector('.eye-icon') as HTMLImageElement;
    const input = this.input;
    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        eyeImg.src = '/src/assets/eye.png';
        eyeImg.alt = 'eye open';
      } else {
        input.type = 'password';
        eyeImg.src = '/src/assets/hide.png';
        eyeImg.alt = 'eye closed';
      }
    }
  }

  private handleInput(): void {
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
      input.removeEventListener('input', this.inputHandler);
    }
    const eyeIcon = this.self?.querySelector('.form__input__eye-icon') as HTMLElement;
    if (eyeIcon) {
      eyeIcon.removeEventListener('click', this.eyeClickHandler);
    }
  }
}
