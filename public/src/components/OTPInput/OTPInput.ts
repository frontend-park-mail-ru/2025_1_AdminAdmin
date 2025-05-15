import template from './OTPInput.hbs';

interface OTPProps {
  id: string;
  digits: number;
  insert?: InsertPosition;
}

export class OTPInput {
  private parent: HTMLElement;
  private props: OTPProps;
  private container!: HTMLElement;
  private inputs: HTMLInputElement[] = [];
  private emptyChar = ' ';
  private updateTo?: HTMLInputElement;

  constructor(parent: HTMLElement, props: OTPProps) {
    if (!parent) throw new Error('VanillaOTP: no parent!');
    this.parent = parent;
    this.props = {
      id: props.id,
      digits: props.digits,
      insert: props.insert || 'beforeend',
    };
  }

  render(): void {
    const html = template({ id: this.props.id, inputs: [...Array(this.props.digits).keys()] });
    this.parent.insertAdjacentHTML(this.props.insert, html);
    this.container = this.parent.querySelector(`#${this.props.id}`);
    this.inputs = Array.from(this.container.querySelectorAll<HTMLInputElement>('.otp-input input'));

    this.inputs.forEach((input, i) => {
      input.addEventListener('input', this.onInput(i));
      input.addEventListener('keydown', this.onKeyDown(i));
    });
  }

  private readonly onInput = (i: number) => (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (isNaN(Number(input.value))) {
      input.value = input.dataset.otpInputRestore || '';
      return this.updateValue();
    }

    if (input.value.length === 0) {
      return this.saveInputValue(i);
    }

    if (input.value.length === 1) {
      this.saveInputValue(i);
      this.updateValue();
      if (i + 1 < this.inputs.length) this.inputs[i + 1].focus();
      return;
    }

    const chars = input.value.split('');
    for (let pos = 0; pos < chars.length; pos++) {
      if (pos + i >= this.inputs.length) break;
      this.setInputValue(pos + i, chars[pos]);
    }

    const focusIndex = Math.min(this.inputs.length - 1, i + chars.length);
    this.inputs[focusIndex].focus();
  };

  private readonly onKeyDown = (i: number) => (e: KeyboardEvent) => {
    const input = this.inputs[i];

    if (e.key === 'Backspace') {
      this.handleBackspace(i, input);
      return;
    }

    if (e.key === 'Delete') {
      this.handleDelete(i, input, e);
      return;
    }

    if (e.key === 'ArrowLeft') {
      this.handleArrowLeft(i, input, e);
      return;
    }

    if (e.key === 'ArrowRight') {
      this.handleArrowRight(i, input, e);
    }
  };

  private handleBackspace(i: number, input: HTMLInputElement) {
    if (input.value === '' && i !== 0) {
      this.setInputValue(i - 1, '');
      this.inputs[i - 1].focus();
    }
  }

  private handleDelete(i: number, input: HTMLInputElement, e: KeyboardEvent) {
    if (i !== this.inputs.length - 1) {
      const start = input.selectionStart || 0;
      for (let pos = i + start; pos < this.inputs.length - 1; pos++) {
        this.setInputValue(pos, this.inputs[pos + 1].value);
      }
      this.setInputValue(this.inputs.length - 1, '');
      e.preventDefault();
    }
  }

  private handleArrowLeft(i: number, input: HTMLInputElement, e: KeyboardEvent) {
    if (input.selectionStart === 0 || input.selectionStart == null) {
      if (i > 0) {
        e.preventDefault();
        this.inputs[i - 1].focus();
        this.inputs[i - 1].select();
      }
    }
  }

  private handleArrowRight(i: number, input: HTMLInputElement, e: KeyboardEvent) {
    if (input.selectionEnd === input.value.length || input.selectionEnd == null) {
      if (i + 1 < this.inputs.length) {
        e.preventDefault();
        this.inputs[i + 1].focus();
        this.inputs[i + 1].select();
      }
    }
  }

  private setInputValue(index: number, value: string): void {
    if (!this.inputs[index]) return;
    if (isNaN(Number(value))) return;
    this.inputs[index].value = value.substring(0, 1);
    this.saveInputValue(index);
    this.updateValue();
  }

  private saveInputValue(index: number, value?: string): void {
    if (!this.inputs[index]) return;
    this.inputs[index].dataset.otpInputRestore = value || this.inputs[index].value;
  }

  private updateValue(): void {
    if (this.updateTo) this.updateTo.value = this.getValue();
  }

  getValue(): string {
    return this.inputs.map((input) => input.value || this.emptyChar).join('');
  }

  setValue(value: string | number): void {
    if (isNaN(Number(value))) {
      console.error('VanillaOTP: value must be a number');
      return;
    }
    const chars = String(value).split('');
    for (let i = 0; i < this.inputs.length; i++) {
      this.setInputValue(i, chars[i] || '');
    }
  }

  setUpdateTarget(input: HTMLInputElement) {
    this.updateTo = input;
    this.updateValue();
  }

  setEmptyChar(char: string): void {
    this.emptyChar = char;
  }

  remove(): void {
    this.inputs.forEach((input, i) => {
      input.removeEventListener('input', this.onInput(i));
      input.removeEventListener('keydown', this.onKeyDown(i));
    });
    this.container?.remove();
  }
}
