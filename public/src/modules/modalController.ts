import { QRModal } from '@components/qrModal/qrModal';

interface Modal {
  self: HTMLElement | null;
  render(): void;
  remove(): void;
  closeElem: HTMLElement | null;
}

class ModalController {
  private currentModal: Modal | null = null;
  private readonly clickCloseHandler: (event: MouseEvent) => void;
  private readonly keyDownHandler: (event: KeyboardEvent) => void;

  constructor() {
    this.clickCloseHandler = this.handleClickOutside.bind(this);
    this.keyDownHandler = this.handleKeyDown.bind(this);
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  private handlePopState(): void {
    this.closeModal();
  }

  private handleClickOutside(event: MouseEvent): void {
    if (
      event.target === this.currentModal?.closeElem ||
      (event.target === this.currentModal.self && !(this.currentModal instanceof QRModal))
    ) {
      this.closeModal();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  openModal(modal: Modal): void {
    this.closeModal();

    this.currentModal = modal;
    modal.render();

    document.addEventListener('click', this.clickCloseHandler);
    document.addEventListener('keydown', this.keyDownHandler);
  }

  closeModal(): void {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;

      document.removeEventListener('click', this.clickCloseHandler);
      document.removeEventListener('keydown', this.keyDownHandler);
    }
  }
}

const modalController = new ModalController();
export { modalController };
