import { Button } from 'doordashers-ui-kit';

import copyImg from '@assets/copy.svg';
import copiedImg from '@assets/copied.svg';

import template from './promocodeCard.hbs';
import { I_Promocode } from '@myTypes/promocodeTypes';
import { formatDate } from '@modules/utils';
import { toasts } from 'doordashers-ui-kit';

/**
 * Класс карточки промокода
 */
export class PromocodeCard {
  private parent: HTMLElement;
  readonly props: I_Promocode;
  private readonly onCopy: (id: string) => void;
  private components: {
    copyButton: Button;
  };

  /**
   * Создает экземпляр карточки промокода
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка
   * @param {PromocodeCardProps} props - Словарь данных для определения свойств карточки
   */
  constructor(parent: HTMLElement, props: I_Promocode, onCopy: (id: string) => void) {
    this.onCopy = onCopy;
    if (!parent) {
      throw new Error('PromocodeCard: no parent!');
    }
    this.parent = parent;
    if (props.discount <= 0) {
      throw new Error('PromocodeCard: discount size must be > 0!');
    }
    this.props = props;
    this.components = {
      copyButton: undefined,
    };
  }

  setIcon(img: string): void {
    this.components.copyButton.setIcon(img);
  }
  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find promocodeCard with id ${this.props.id}`);
    }
    return element;
  }

  /**
   * Отображает карточку товара на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Error: productCard template not found');
    }
    if (document.getElementById(this.props.id)) {
      throw new Error(`Error: id "${this.props.id}" is already in use`);
    }

    // Рендерим шаблончик с данными
    const html = template({
      ...this.props,
      expires_at: formatDate(this.props.expires_at),
      dark: this.props.discount < 0.2,
      discount: this.props.discount * 100,
    });
    this.parent.insertAdjacentHTML('beforeend', html);

    // Добавляем кнопку копирования
    const copyButtonContainer = this.self.querySelector(
      '.promocode-card__copy-button-container',
    ) as HTMLElement;
    this.components.copyButton = new Button(copyButtonContainer, {
      id: `${this.props.id}__copy-button`,
      iconSrc: copyImg,
      iconAlt: 'Скопировать',
      onSubmit: () => this.copypromocode(),
    });
    this.components.copyButton.render();
  }

  /**
   * Копироует промокод в буфер обмена и выводит консоль лог об успешности компирования
   */
  private copypromocode(): void {
    this.onCopy(this.props.id);
    this.components.copyButton.setIcon(copiedImg);

    navigator.clipboard
      .writeText(this.props.promocode)
      .then(() => {
        toasts.success(`Промокод ${this.props.promocode} успешно скопирован`);
      })
      .catch((error) => {
        toasts.error(`Не удалось скопировать промокод ${this.props.promocode}: ${error}`);
      });
  }

  /**
   * Плавно скрывает карточку промокода
   */
  hide(): void {
    this.self.classList.remove('appeared');
    this.self.classList.add('disappeared');
  }

  /**
   * Плавно показывает карточку промокода
   */
  show(): void {
    this.self.classList.remove('disappeared');
    this.self.classList.add('appeared');
  }

  /**
   * Удаляет карточку промокода
   */
  remove() {
    const element = this.self;
    if (this.components.copyButton) this.components.copyButton.remove();
    element.remove();
  }
}
