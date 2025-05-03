import { Logo } from '@components/logo/logo';
import logoImg from '@assets/logo.png';
import leftArrowImg from '@assets/left-arrow.png';
import { Button } from '@components/button/button';
import { router } from '@modules/routing';

/**
 * Класс AuxHeader представляет заголовок страниц логина и авторизации.
 */
export default class AuxHeader {
  private readonly parent: HTMLElement;
  private logo?: Logo;
  private backButton: Button;

  /**
   * Создает экземпляр заголовка.
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться заголовок.
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  /**
   * Отображает заголовок на странице.
   */
  render(): void {
    this.parent.classList.add('aux_header');
    this.logo = new Logo(this.parent, logoImg);
    this.logo.render();

    this.backButton = new Button(this.parent, {
      id: 'header-back-button',
      iconSrc: leftArrowImg,
      iconAlt: 'back',
      onSubmit: () => router.goBack(),
    });

    this.backButton.render();
  }

  /**
   * Удаляет заголовок со страницы и снимает обработчики событий.
   */
  remove(): void {
    this.parent.classList.remove('aux_header');
    this.logo?.remove();
    this.parent.innerHTML = '';
  }
}
