import template from './qrModal.hbs';
import { Button } from '@components/button/button';

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

  get closeElem(): HTMLElement | null {
    return this.submitBtn?.self ?? null;
  }

  render() {
    const html = template({ qrSrc: this.qrSrc });
    document.body.insertAdjacentHTML('beforeend', html);
    document.body.style.overflow = 'hidden';

    const buttonContainer: HTMLElement = this.self.querySelector('.form__line');

    this.submitBtn = new Button(buttonContainer, {
      id: 'qr_modal__submit',
      style: 'dark form__button',
      text: `Подождите ${this.delaySeconds} сек`,
      disabled: true,
      onSubmit: async () => {
        this.closeElem?.click();
      },
    });

    this.submitBtn.render();

    this.self.style.pointerEvents = 'none';
    this.startCountdown();
  }

  private startCountdown() {
    let secondsLeft = this.delaySeconds;

    const interval = setInterval(() => {
      secondsLeft--;

      if (secondsLeft > 0) {
        this.submitBtn.setText(`Подождите ${secondsLeft} сек`);
      } else {
        clearInterval(interval);
        this.submitBtn.setText('Продолжить');
        this.submitBtn.enable();

        this.self.style.pointerEvents = '';
      }
    }, 1000);
  }

  remove() {
    this.submitBtn.remove();
    this.self?.remove();
    document.body.style.overflow = '';
  }
}
