import MapModal from '../pages/mapModal/mapModal';

export default class ModalController {
  private currentModal: MapModal | null = null;
  private readonly clickOutsideHandler: (event: MouseEvent) => void;

  constructor() {
    this.clickOutsideHandler = this.handleClickOutside.bind(this);
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  private handlePopState(): void {
    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }
  }

  private getModalHash(modal: MapModal): string {
    return `#modal-${modal.constructor.name}`;
  }

  private handleClickOutside(event: MouseEvent): void {
    if (this.currentModal && !this.currentModal.window.contains(event.target as Node)) {
      this.closeModal(this.currentModal);
    }
  }

  openModal(modal: MapModal): void {
    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }

    this.currentModal = modal;
    history.pushState({}, '', this.getModalHash(modal));
    modal.render();

    document.addEventListener('click', this.clickOutsideHandler);
  }

  closeModal(modal: MapModal): void {
    if (this.currentModal === modal) {
      this.currentModal.remove();
      this.currentModal = null;
      history.pushState({}, '', window.location.pathname);
      document.removeEventListener('click', this.clickOutsideHandler);
    }
  }

  remove(): void {
    window.removeEventListener('popstate', this.handlePopState.bind(this));
    document.removeEventListener('click', this.clickOutsideHandler);

    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }
  }
}
