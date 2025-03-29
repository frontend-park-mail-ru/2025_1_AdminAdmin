import { FormInput } from '../../components/formInput/formInput';
import { SuggestsContainer } from '../../components/suggestsContainer/suggestsContainer';
import { Button } from '../../components/button/button';
import template from './mapModal.hbs';
import type { YMapLocationRequest } from 'ymaps3';
import { YMap, YMapDefaultSchemeLayer } from '../../lib/ymaps';

/**
 * Класс, представляющий форму логина.
 */
export default class MapModal {
  private suggestsContainer: SuggestsContainer;
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
  render() {
    const modalHTML = template();

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const searchContainer: HTMLElement = document.querySelector('.map_modal__search_container');

    this.suggestsContainer = new SuggestsContainer(searchContainer);
    this.suggestsContainer.render();

    const formLineSearch = document.getElementById('form__line_search');

    this.submitBtn = new Button(formLineSearch, {
      id: 'form__line__search_button',
      text: 'ОК',
      disabled: true,
      style: 'dark big',
    });
    this.submitBtn.render();
    document.body.style.overflow = 'hidden';
    this.addCloseEventListener();
  }

  /**
   * Очистка модального окна и снятие обработчиков
   */
  private addCloseEventListener(): void {
    this.self.addEventListener('click', this.closeEventHandler);
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

  remove(): void {
    document.body.style.overflow = '';
    this.self.removeEventListener('click', this.closeEventHandler);
    this.submitBtn.remove();
    this.suggestsContainer.remove();
    this.self.remove();
  }
}
