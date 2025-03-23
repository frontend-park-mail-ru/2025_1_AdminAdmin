import template from './formInput.hbs';

interface FormInputProps {
  id: string;
  label: string;
  error: string;
  placeholder: string;
  type: string;
  required: boolean;
  validator: (value: string) => { result: boolean; message?: string };
}

export class FormInput {
  private parent: HTMLElement;
  private readonly inputHandler: () => void;
  private readonly eyeClickHandler: () => void;
  private readonly props: FormInputProps;

  /**
   * Ссылка на объект
   * @returns {HTMLElement | null} - ссылка на объект
   */
  private get self(): HTMLElement | null {
    return document.getElementById(this.props.id);
  }

  /**
   * Ссылка на поле ввода
   * @returns {HTMLInputElement | null} - ссылка на поле ввода
   */
  get input(): HTMLInputElement | null {
    return this.self?.querySelector('input');
  }

  /**
   * Создает экземпляр поля ввода.
   * @constructor
   * @param parent - Родительский элемент, в который будет рендерится поле ввода.
   * @param props - Словарь данных для определения свойств поля ввода.
   */
  constructor(parent: HTMLElement, props: FormInputProps) {
    if (!parent) {
      throw new Error('FormInput: no parent!');
    }
    this.parent = parent;
    this.inputHandler = this.checkValue.bind(this);
    this.eyeClickHandler = this.handleClick.bind(this);

    this.props = {
      id: props.id,
      label: props.label,
      error: props.error,
      placeholder: props.placeholder,
      type: props.type,
      required: props.required,
      validator: props.validator,
    };
  }

  /**
   * Отображает поле ввода на странице.
   */
  render(): void {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    if (this.props.type === 'password') {
      const eyeIcon = this.self?.querySelector('.form__input__eye-icon') as HTMLElement;
      if (eyeIcon) {
        eyeIcon.style.display = 'block';
        eyeIcon.addEventListener('click', this.eyeClickHandler);
      }
    }

    const input = this.self?.querySelector('input');
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

  checkValue(): boolean {
    const value = this.input?.value.trim() || '';
    const validationResult = this.props.validator(value);
    if (!validationResult.result) {
      this.setError(validationResult.message || '');
    } else {
      this.clearError();
    }

    return validationResult.result;
  }

  /**
   * Отображает ошибку рядом с полем ввода.
   * @param errorMessage - сообщение ошибки.
   */
  setError(errorMessage: string): void {
    const errorElement = this.parent.querySelector(`#${this.props.id}-error`) as HTMLElement;
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }

    const input = this.input;
    if (input) {
      input.classList.add('error');
    }
  }

  /**
   * Убирает отображение ошибки.
   */
  clearError(): void {
    const errorElement = this.parent.querySelector(`#${this.props.id}-error`) as HTMLElement;
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    const input = this.input;
    if (input) {
      input.classList.remove('error');
    }
  }

  /**
   * Возвращает значение в поле ввода.
   * @returns {string} - введенная строка.
   */
  get value(): string {
    return this.input?.value || '';
  }

  /**
   * Удаляет обработчики событий.
   */
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
