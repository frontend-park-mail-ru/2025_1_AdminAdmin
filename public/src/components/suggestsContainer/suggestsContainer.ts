import template from './suggestsContainer.hbs';
import { I_Suggest } from '../../modules/ymapsRequests';
import { Suggest } from '../suggest/suggest';
import { FormInput } from '../formInput/formInput';

class SuggestsContainer {
  private suggests: Suggest[] = [];
  private parentInput: FormInput | null = null;

  constructor() {}

  render(parentInput: FormInput) {
    this.parentInput = parentInput;
    const html = template();
    const parent = parentInput.self;
    parent.insertAdjacentHTML('beforeend', html);
  }

  private get self(): HTMLElement | null {
    return document.querySelector('.suggest_box');
  }

  show(props: I_Suggest): void {
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

  private handleSuggestClick(address: string) {
    if (!this.parentInput) {
      console.error('No parent input assigned');
      return;
    }
    this.parentInput.input.value = address;
  }
}

export const suggestsContainer = new SuggestsContainer();
