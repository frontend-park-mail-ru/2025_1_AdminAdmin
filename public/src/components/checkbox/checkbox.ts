import template from './checkbox.hbs';

export interface CheckboxProps {
  id: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export class Checkbox {
  protected parent: HTMLElement;
  protected props: CheckboxProps;

  constructor(parent: HTMLElement, props: CheckboxProps) {
    if (!parent) {
      throw new Error('Checkbox: no parent!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      label: props.label || '',
      checked: props.checked || false,
      disabled: props.disabled || false,
      onClick: props.onClick,
    };
  }

  handleCheck = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }

    this.props.checked = !this.props.checked;
    this.self.checked = this.props.checked;
  };

  get self(): HTMLInputElement {
    const element = document.getElementById(this.props.id) as HTMLInputElement;
    if (!element) {
      throw new Error(`Checkbox: can't find checkbox with id ${this.props.id}`);
    }
    return element;
  }

  get isChecked(): boolean {
    return this.props.checked;
  }

  setChecked(checked: boolean): void {
    this.self.checked = checked;
    this.props.checked = checked;
  }

  enable(): void {
    this.self.removeAttribute('disabled');
  }

  disable(): void {
    this.self.setAttribute('disabled', '');
  }

  render(): void {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    const checkbox = this.self;
    if (checkbox) {
      checkbox.addEventListener('click', this.handleCheck);
    }
  }

  remove(): void {
    const checkbox = this.self;
    if (checkbox) {
      checkbox.removeEventListener('click', this.handleCheck);
      checkbox.closest('.checkbox-container')?.remove();
    }
  }
}
