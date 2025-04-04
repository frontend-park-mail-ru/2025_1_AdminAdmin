import template from './suggest.hbs';
import { Highlight, I_Suggest } from '@modules/ymapsRequests';

export class Suggest {
  private readonly parent: HTMLElement;
  private readonly text: string;
  private readonly tags: string[];
  private readonly id: string;
  private readonly highlight: Highlight[];
  private readonly subtitle: string;
  private readonly distance: number | null;
  private readonly address: string | null;
  private readonly uri: string;
  private readonly onClick: (text: string, tags: string[], uri: string) => void;
  private readonly clickHandler: (event: Event) => void;

  constructor(
    parent: HTMLElement,
    id: string,
    props: I_Suggest,
    onClick: (text: string, tags: string[], uri: string) => void,
  ) {
    this.parent = parent;
    this.id = id;
    this.text = props.title.text;
    this.tags = props.tags;
    this.highlight = props.title.hl;
    this.subtitle = props.subtitle ? props.subtitle.text : '';
    this.distance = props.distance ? props.distance.value : null;
    this.address = props.address ? props.address.formatted_address : null;
    this.uri = props.uri;
    this.onClick = onClick;

    this.clickHandler = this.handleClick.bind(this);
  }

  /* Рендер */
  render(): void {
    let highlightedText = '';

    if (this.highlight) {
      let currentBegin = 0;
      for (const highlight of this.highlight) {
        const { begin, end } = highlight;
        highlightedText += this.text.substring(currentBegin, begin);
        highlightedText += `<span class="highlight">${this.text.substring(begin, end)}</span>`;
        currentBegin = end;
      }
      highlightedText += this.text.substring(currentBegin);
    } else {
      highlightedText = this.text;
    }

    const html = template({
      id: this.id,
      text: highlightedText,
      subtitle: this.subtitle,
      distance: this.distance !== null ? `${this.distance} м` : '',
      address: this.address || '',
    });

    this.parent.insertAdjacentHTML('beforeend', html);

    const suggestElement = this.self;
    suggestElement.addEventListener('click', this.clickHandler);
  }

  private handleClick() {
    if (this.onClick) {
      this.onClick(this.address || '', this.tags, this.uri);
    }
  }

  /**
   * Возвращает HTML элемент компонента
   * @returns {HTMLElement}
   */
  get self(): HTMLElement {
    return document.getElementById(this.id)!;
  }

  /**
   * Закрывает тост
   */
  remove(): void {
    const suggestElement = this.self;
    if (!suggestElement) return;
    suggestElement.removeEventListener('click', this.clickHandler);
    suggestElement.remove();
  }
}
