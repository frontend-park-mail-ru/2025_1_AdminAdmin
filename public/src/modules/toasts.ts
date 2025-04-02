import { Toast } from '../components/toast/toast';

export const TOAST_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
};

export class Toasts {
  private toasts: Toast[] = [];

  constructor() {}

  private get self(): HTMLElement | null {
    return document.querySelector('.toastBox');
  }

  private show(type: string, message: string): void {
    const parent = this.self;
    if (!parent) {
      console.error('Toast container not found!');
      return;
    }

    const toast = new Toast(parent, type, message);
    toast.render();

    this.toasts.push(toast);

    if (this.toasts.length > 5) {
      const hiddenToast = this.toasts.shift();
      if (hiddenToast) {
        hiddenToast.close();
      }
    }
  }

  public success(message: string): void {
    this.show(TOAST_TYPE.SUCCESS, message);
  }

  public error(message: string): void {
    this.show(TOAST_TYPE.ERROR, message);
  }

  public info(message: string): void {
    this.show(TOAST_TYPE.INFO, message);
  }
}

export const toasts = new Toasts();
