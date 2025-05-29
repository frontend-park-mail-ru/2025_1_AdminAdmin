import template from './promotionCard.hbs';

/**
 * Класс карточки акции
 */
export class PromotionCard {
  private parent: HTMLElement;
  private readonly text: string;
  private readonly colorStart: string;
  private readonly colorEnd: string;
  private readonly subText?: string;

  /**
   * @param parent Родительский элемент
   * @param text Текст акции
   * @param colorStart Начальный цвет градиента
   * @param colorEnd Конечный цвет градиента
   * @param subText
   */
  constructor(
    parent: HTMLElement,
    text: string,
    colorStart = '#6e8efb',
    colorEnd = '#a777e3',
    subText?: string,
  ) {
    this.parent = parent;
    this.text = text;
    this.colorStart = colorStart;
    this.colorEnd = colorEnd;
    this.subText = subText;
  }

  render(pushDirection: InsertPosition = 'beforeend') {
    const html = template({
      text: this.text,
      colorStart: this.colorStart,
      colorEnd: this.colorEnd,
      subText: this.subText,
    });
    this.parent.insertAdjacentHTML(pushDirection, html);
  }
}
