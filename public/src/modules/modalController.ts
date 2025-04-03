import MapModal from '@pages/mapModal/mapModal';

export default class ModalController {
  private currentModal: MapModal | null = null;
  private readonly clickCloseHandler: (event: MouseEvent) => void;

  constructor() {
    this.clickCloseHandler = this.handleClickOutside.bind(this);
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  private handlePopState(): void {
    this.closeModal();
  }

  private handleClickOutside(event: MouseEvent): void {
    if (this.currentModal && event.target === this.currentModal.closeElem) {
      this.closeModal();
    }
  }

  openModal(modal: MapModal): void {
    this.closeModal();

    this.currentModal = modal;
    modal.render();

    document.addEventListener('click', this.clickCloseHandler);
  }

  closeModal(): void {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
      document.removeEventListener('click', this.clickCloseHandler);
    }
  }

  remove(): void {
    window.removeEventListener('popstate', this.handlePopState.bind(this));
    document.removeEventListener('click', this.clickCloseHandler);

    this.closeModal();
  }
}
