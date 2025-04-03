import { router } from '../../modules/routing';
import template from './logo.hbs';

/**
 * Класс логотипа
 */
export class Logo {
  private parent: HTMLElement; // Родитель (где вызывается)
  private readonly clickHandler: (event: Event) => void;
  private readonly props: { image: string };

  /**
   * Создает экземпляр лого
   * @constructor
   * @param parent {HTMLElement} - Родительский элемент, в который будет рендериться лого
   * @param image {string} - Путь до картинки лого
   */
  constructor(parent: HTMLElement, image: string) {
    this.parent = parent;
    this.props = { image: image };
    this.clickHandler = this.handleClick.bind(this);
  }

  /**
   * Обработчик нажатия на лого
   * @private
   */
  private addEventListeners() {
    document.addEventListener('click', this.clickHandler);
  }

  /**
   * Действие при нажатии на лого
   * @private
   */
  private handleClick(event: Event) {
    const target = event.target as HTMLElement;
    const logo = target.closest('.logo');
    if (logo) {
      router.goToPage('home');
    }
  }

  /**
   * Отображает лого на странице
   */
  render() {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    this.addEventListeners();
  }

  /**
   * Удаляет лого со страницы и снимает обработчики событий.
   */
  remove() {
    document.removeEventListener('click', this.clickHandler);
    document.querySelector('.logo')?.remove();
  }
}
