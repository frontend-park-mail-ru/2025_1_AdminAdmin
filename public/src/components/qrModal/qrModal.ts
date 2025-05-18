import template from './qrModal.hbs';
import { Button } from '@components/button/button';
import { modalController } from '@modules/modalController';

export class QRModal {
  private submitBtn: Button;
  private readonly qrSrc: string;
  private readonly delaySeconds = 10;

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

    const blocker = document.createElement('div');
    blocker.classList.add('qr_modal__blocker');
    this.self.appendChild(blocker);

    const buttonContainer: HTMLElement = this.self.querySelector('.form__line');

    this.submitBtn = new Button(buttonContainer, {
      id: 'qr_modal__submit',
      style: 'dark form__button',
      text: `Подождите ${this.delaySeconds} сек`,
      disabled: true,
      onSubmit: async () => {
        modalController.closeModal();
      },
    });

    this.submitBtn.render();

    this.startCountdown(blocker);
  }

  private startCountdown(blocker: HTMLElement) {
    let secondsLeft = this.delaySeconds;

    const interval = setInterval(() => {
      secondsLeft--;

      if (secondsLeft > 0) {
        this.submitBtn.setText(`Подождите ${secondsLeft} сек`);
      } else {
        clearInterval(interval);
        this.submitBtn.setText('Я сохранил QR-код');
        this.submitBtn.enable();

        blocker.remove();
      }
    }, 1000);
  }

  remove() {
    this.submitBtn.remove();
    this.self?.remove();
    document.body.style.overflow = '';
  }
}
