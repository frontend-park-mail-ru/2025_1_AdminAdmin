import template from './qrModal.hbs';
import { Button } from '@components/button/button';
import { modalController } from '@modules/modalController';

export class QRModal {
  private submitBtn: Button;
  private readonly qrSrc: string;

  constructor(qrSrc: string) {
    this.qrSrc = qrSrc;
  }

  get self(): HTMLElement {
    return document.querySelector('.qr_modal');
  }

  get closeElem(): HTMLElement {
    return this.submitBtn.self;
  }

  render() {
    const html = template({ qrSrc: this.qrSrc });
    document.body.insertAdjacentHTML('beforeend', html);
    document.body.style.overflow = 'hidden';

    const buttonContainer: HTMLElement = this.self.querySelector('.form__line');

    this.submitBtn = new Button(buttonContainer, {
      id: 'qr_modal__submit',
      style: 'dark form__button',
      text: `Я сохранил QR код`,
      onSubmit: () => {
        modalController.closeModal();
      },
    });

    this.submitBtn.render();
  }

  remove() {
    this.submitBtn.remove();
    this.self?.remove();
    document.body.style.overflow = '';
  }
}
