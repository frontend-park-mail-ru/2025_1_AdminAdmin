export class FormInput {
  #parent;
  #props = {
    id: '',
    label: '',
    error: '',
    placeholder: '',
    type: '',
    required: false,
  };

  get self() {
    return document.getElementById(this.#props.id);
  }

  get input() {
    return this.self.querySelector('input');
  }

  constructor(parent, props) {
    if (!parent) {
      throw new Error('Form__input: no parent!');
    }
    this.#parent = parent;
    this.#props = {
      id: props.id,
      label: props.label,
      error: props.error,
      placeholder: props.placeholder,
      type: props.type,
      required: props.required,
    };
  }

  render() {
    const template = window.Handlebars.templates['formInput.hbs'];
    const html = template(this.#props);
    this.#parent.insertAdjacentHTML('beforeend', html);

    // Применяем маску к полю телефона
    if (this.#props.id === 'phone') {
      // Применяем только к полю телефона
      const phoneInput = this.input;
      this.addPhoneMask(phoneInput);
    }
  }

  setError(errorMessage) {
    const errorElement = this.#parent.querySelector(`#${this.#props.id}-error`);
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }

    this.input.classList.add('error');
  }

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

  get value() {
    return this.input ? this.input.value : '';
  }
}
