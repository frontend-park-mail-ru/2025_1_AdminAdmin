import template from './suggestsContainer.hbs';
import { I_Suggest } from '../../modules/ymapsRequests';
import { Suggest } from '../suggest/suggest';

class SuggestsContainer {
  private suggests: Suggest[] = [];

  constructor() {}

  render(parent: HTMLElement) {
    console.log(parent);
    const html = template();
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

    const suggest = new Suggest(parent, props);
    suggest.render();

    this.suggests.push(suggest);
  }

  clear() {
    for (const suggest of this.suggests) {
      suggest.remove();
    }

    this.suggests = [];
  }
}

export const suggestsContainer = new SuggestsContainer();
