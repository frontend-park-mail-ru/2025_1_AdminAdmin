import { FormInput } from '../../components/formInput/formInput';
import { suggestsContainer } from '../../components/suggestsContainer/suggestsContainer';
import { Button } from '../../components/button/button';
import template from './mapModal.hbs';
import config from './mapModalConfig';
import type { YMapLocationRequest } from 'ymaps3';
import { YMap, YMapDefaultSchemeLayer } from '../../lib/ymaps';

/**
 * Класс, представляющий форму логина.
 */
export default class MapModal {
  private searchInput: FormInput;
  private submitBtn: Button;
  private readonly closeEventHandler: (event: Event) => void;

  /**
   * Конструктор класса
   * @constructor
   */
  constructor() {
    this.closeEventHandler = this.handleClose.bind(this);
  }

  /**
   * Получение HTML элемента формы
   * @returns {HTMLElement | null}
   */
  private get self(): HTMLElement | null {
    return document.querySelector('.map_modal');
  }

  private get map(): HTMLElement | null {
    return document.querySelector('.map');
  }
  /**
   * Рендеринг модального окна
   */
  async render(): Promise<void> {
    const modalHTML = template();

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const searchContainer = document.getElementById('form__line_search')!;

    this.searchInput = new FormInput(searchContainer, config.inputs.searchInput);
    this.searchInput.render();

    suggestsContainer.render(this.searchInput);

    this.submitBtn = new Button(searchContainer, {
      ...config.buttons.submitBtn,
    });
    this.submitBtn.render();
    document.body.style.overflow = 'hidden';

    this.addCloseEventListener();
  }

  /**
   * Добавляет обработчик события для закрытия модального окна
   */
  private addCloseEventListener(): void {
    const modal = this.self;
    if (modal) {
      modal.addEventListener('click', this.closeEventHandler);
    }
  }

  /**
   * Обработчик закрытия модалки
   * Удаляет модалку при клике на неё
   */
  private handleClose(event: Event): void {
    const modal = this.self;
    if (modal) {
      const target = event.target as HTMLElement;
      if (target === modal) {
        this.remove();
      }
    }
  }

  /**
   * Очистка модального окна и снятие обработчиков
   */
  remove(): void {
    const modal = this.self;
    document.body.style.overflow = '';
    if (modal) {
      modal.removeEventListener('click', this.closeEventHandler);
    }

    this.searchInput.remove();
    this.submitBtn.remove();
    if (modal) {
      modal.remove();
    }
  }
}
