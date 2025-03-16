import template from './formInput.hbs';

export class FormInput {
  #parent;
  #inputHandler;
  #eyeClickHandler;
  #props = {
    // Свойства поля ввода
    id: '', // Id для идентификации
    label: '', // Заголовок поля ввода (перед полем ввода)
    error: '', // Дополнительная информация (ошибка или подсказка)
    placeholder: '', // начальный текст
    type: '', // Тип поля ввода
    required: false, // Обязательное поле или нет
    validator: '',
  };

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self() {
    return document.getElementById(this.#props.id);
  }

  /**
   * Ссылка на поле ввода
   * @returns {HTMLElement} - ссылка на объект
   */
  get input() {
    return this.self.querySelector('input');
  }

  /**
   *Создает экземпляр поля ввода.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться поле ввода.
   * @param {Object} props - Словарь данных для определения свойств поля ввода
   */
  constructor(parent, props) {
    if (!parent) {
      throw new Error('Form__input: no parent!');
    }
    this.#parent = parent;
    this.#inputHandler = this.checkValue.bind(this);
    this.#props = {
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
  render() {
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);

    if (this.#props.type === 'password') {
      const eyeIcon = this.self.querySelector('.form__input__eye-icon');
      eyeIcon.style.display = 'block';
      this.#eyeClickHandler = this.#handleClick.bind(this, eyeIcon);
      eyeIcon.addEventListener('click', this.#eyeClickHandler);
    }

    this.self.addEventListener('input', this.#inputHandler);
  }

  #handleClick(eyeIcon) {
    const eyeImg = eyeIcon.querySelector('img');
    if (this.input.type === 'password') {
      this.input.type = 'text';
      eyeImg.src = '/src/assets/eye.png';
      eyeImg.alt = 'eye open';
    } else {
      this.input.type = 'password';
      eyeImg.src = '/src/assets/hide.png';
      eyeImg.alt = 'eye closed';
    }
  }

  checkValue() {
    const value = this.input.value.trim();
    const validationResult = this.#props.validator(value);
    if (!validationResult.result) {
      this.setError(validationResult.message);
    } else {
      this.clearError();
    }

    return validationResult.result;
  }

  /**
   * Отображает ошибку рядом с полем ввода.
   * @param {String} errorMessage - сообщение ошибки
   */
  setError(errorMessage) {
    const errorElement = this.#parent.querySelector(`#${this.#props.id}-error`);
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }

    this.input.classList.add('error');
  }

  /**
   * Убирает отображение ошибки
   */
  clearError() {
    const errorElement = this.#parent.querySelector(`#${this.#props.id}-error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    if (this.input) {
      this.input.classList.remove('error');
    }
  }

  /**
   * Возвращает значение в поле ввода
   * @returns {String} - введенная строка
   */
  get value() {
    return this.input ? this.input.value : '';
  }

  remove() {
    this.self.removeEventListener('input', this.#inputHandler);
    const eyeIcon = this.self.querySelector('.form__input__eye-icon');
    if (eyeIcon) {
      eyeIcon.removeEventListener('click', this.#eyeClickHandler);
    }
  }
}
