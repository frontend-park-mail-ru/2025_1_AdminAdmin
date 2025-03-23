import template from './toast.hbs';

export class Toast {
  private readonly parent: HTMLElement;
  private readonly type: string;
  private readonly message: string;
  private readonly id: string;

  constructor(parent: HTMLElement, type: string, message: string) {
    this.parent = parent;
    this.type = type;
    this.message = message;
    this.id = `toast-${Date.now()}`;
  }

  /* Рендер */
  render(): void {
    const html = template({ id: this.id, type: this.type, message: this.message });
    this.parent.insertAdjacentHTML('beforeend', html);

    const toastElement = document.getElementById(this.id);
    if (toastElement) {
      setTimeout(() => {
        toastElement.remove();
      }, 6000);
    }
  }
}
