import { Button } from '../button/button';

import copyImg from '@assets/copy.png';

import template from './promocodeCard.hbs';

/**
 * Пропсы для карточки промокода
 * @property {string}  id - идентификатор карточки промокода
 * @property {string}  promocodeText - текст промокода
 * @property {number}  discountSize - размер скидки в процентах (Пример: 1% -> 1)
 * @property {string}  expiresAt? - время когда истекает (справочная информация)
 */
interface PromocodeCardProps {
  id: string;
  promocodeText: string;
  discountSize: number;
  expiresAt?: string;
}

/**
 * Класс карточки промокода
 */
export class PromocodeCard {
  private parent: HTMLElement;
  private props: PromocodeCardProps;
  private components: {
    copyButton: Button;
  };

  /**
   * Создает экземпляр карточки промокода
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка
   * @param {PromocodeCardProps} props - Словарь данных для определения свойств карточки
   */
  constructor(parent: HTMLElement, props: PromocodeCardProps) {
    if (!parent) {
      throw new Error('PromocodeCard: no parent!');
    }
    this.parent = parent;
    if (props.discountSize <= 0) {
      throw new Error('PromocodeCard: discount size must be > 0!');
    }
    this.props = {
      id: props.id,
      promocodeText: props.promocodeText,
      discountSize: props.discountSize,
      expiresAt: props.expiresAt ?? '',
    };
    this.components = {
      copyButton: undefined,
    };
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
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);

    // Добавляем кнопку копирования
    const copyButtonContainer = this.self.querySelector(
      '.promocode-card__copy-button-container',
    ) as HTMLElement;
    this.components.copyButton = new Button(copyButtonContainer, {
      id: `${this.props.id}__copy-button`,
      iconSrc: copyImg,
      iconAlt: 'Скопировать',
      onSubmit: () => this.copyPromocodeText(),
    });
    this.components.copyButton.render();
  }

  /**
   * Копироует промокод в буфер обмена и выводит консоль лог об успешности компирования
   */
  private copyPromocodeText(): void {
    navigator.clipboard
      .writeText(this.props.promocodeText)
      .then(() => {
        //console.log(`Промокод ${this.props.promocodeText} успешно скопирован`);
      })
      .catch((error) => {
        console.error(`Не удалось скопировать промокод ${this.props.promocodeText}:`, error);
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
