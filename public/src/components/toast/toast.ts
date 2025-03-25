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

    setTimeout(() => this.close(), 5000);
  }

  /**
   * Возвращает HTML элемент компонента
   * @returns {HTMLElement}
   */
  get self(): HTMLElement {
    return document.getElementById(this.id);
  }

  /**
   * Закрывает тост
   */
  close(): void {
    const toastElement = this.self;
    if (!toastElement) return;

    toastElement.animate(
      [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(-100%)' },
      ],
      {
        duration: 500,
        easing: 'linear',
        fill: 'forwards',
      },
    );

    setTimeout(() => {
      toastElement.remove();
    }, 500);
  }
}
