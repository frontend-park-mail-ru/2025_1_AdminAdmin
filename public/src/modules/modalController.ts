import MapModal from '../pages/mapModal/mapModal';

export default class ModalController {
  private currentModal: MapModal | null = null;
  private readonly clickCloseHandler: (event: MouseEvent) => void;

  constructor() {
    this.clickCloseHandler = this.handleClickOutside.bind(this);
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  private handlePopState(): void {
    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }
  }

  private handleClickOutside(event: MouseEvent): void {
    if (this.currentModal && event.target === this.currentModal.closeElem) {
      this.closeModal(this.currentModal);
    }
  }

  openModal(modal: MapModal): void {
    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }

    this.currentModal = modal;
    modal.render();

    document.addEventListener('click', this.clickCloseHandler);
  }

  closeModal(modal: MapModal): void {
    if (this.currentModal === modal) {
      this.currentModal.remove();
      this.currentModal = null;
      document.removeEventListener('click', this.clickCloseHandler);
    }
  }

  remove(): void {
    window.removeEventListener('popstate', this.handlePopState.bind(this));
    document.removeEventListener('click', this.clickCloseHandler);

    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }
  }
}
