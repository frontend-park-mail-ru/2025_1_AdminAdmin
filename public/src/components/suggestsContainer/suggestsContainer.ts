import template from './suggestsContainer.hbs';
import { I_Suggest } from '../../modules/ymapsRequests';
import { Suggest } from '../suggest/suggest';
import { geoSuggestRequest } from '../../modules/ymapsRequests';
import debounce from '../../modules/debounce';

export class SuggestsContainer {
  private suggests: Suggest[] = [];
  private readonly parent: HTMLElement;
  private readonly parentInput: HTMLInputElement;
  private readonly debouncedOnInput: (value: string) => void;

  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.parentInput = this.parent.querySelector('input') as HTMLInputElement | null;
    this.debouncedOnInput = debounce(this.onInput.bind(this), 250);

    if (this.parentInput) {
      this.parentInput.addEventListener('input', (event) =>
        this.debouncedOnInput((event.target as HTMLInputElement).value),
      );
      this.parentInput.addEventListener('blur', this.onBlur.bind(this));
      this.parentInput.addEventListener('focus', this.immitateInput.bind(this));
    }
  }

  render() {
    const html = template();
    this.parent.insertAdjacentHTML('beforeend', html);
  }

  private get self(): HTMLElement | null {
    return document.querySelector('.suggest_box');
  }

  private show(props: I_Suggest): void {
    const parent = this.self;
    if (!parent) {
      console.error('Suggest container not found!');
      return;
    }

    const suggest = new Suggest(
      parent,
      this.suggests.length.toString(),
      props,
      this.handleSuggestClick.bind(this),
    );
    suggest.render();

    this.suggests.push(suggest);
  }

  clear() {
    for (const suggest of this.suggests) {
      suggest.remove();
    }
    this.suggests = [];
  }

  private handleSuggestClick(address: string, tags: string[]) {
    this.parentInput.value = address;

    const finalTags = ['house', 'business', 'office', 'hotel'];
    const isFinalAddress = tags.some((tag) => finalTags.includes(tag));

    if (isFinalAddress) {
      this.clear();
      return;
    }

    this.immitateInput();
  }

  private immitateInput() {
    const event = new Event('input', { bubbles: true });
    this.parentInput.dispatchEvent(event);
  }

  private async onInput(value: string) {
    this.clear();
    if (!value) {
      return;
    }

    try {
      const suggestsResponse = await geoSuggestRequest(value);

      if (suggestsResponse.status !== 200) {
        console.error(`Ошибка API: ${suggestsResponse.status}`);
        return;
      }

      const suggests = Array.isArray(suggestsResponse.results) ? suggestsResponse.results : [];

      if (!suggests.length) {
        console.warn('Пустой массив результатов');
        return;
      }

      for (let suggest of suggests) {
        console.log(suggest);
        this.show(suggest);
      }
    } catch (error) {
      console.error('Ошибка запроса:', error);
    }
  }

  private onBlur() {
    setTimeout(() => {
      this.clear();
    }, 200);
  }

  remove() {
    if (this.parentInput) {
      this.parentInput.removeEventListener('input', (event) =>
        this.debouncedOnInput((event.target as HTMLInputElement).value),
      );
      this.parentInput.removeEventListener('blur', this.onBlur);
      this.parentInput.removeEventListener('focus', this.immitateInput);
    }
  }
}
