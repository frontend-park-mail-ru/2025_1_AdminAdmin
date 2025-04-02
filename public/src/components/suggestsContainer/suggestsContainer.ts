import template from './suggestsContainer.hbs';
import { I_Suggest } from '../../modules/ymapsRequests';
import { Suggest } from '../suggest/suggest';

export class SuggestsContainer {
  private suggests: Suggest[] = [];
  private readonly parent: HTMLElement;
  private readonly onSelectAddress: (address: string, tags: string[], uri: string) => void;

  constructor(
    parent: HTMLElement,
    onSelectAddress: (address: string, tags: string[], uri: string) => void,
  ) {
    this.parent = parent;
    this.onSelectAddress = onSelectAddress;
  }

  render() {
    const html = template();
    this.parent.insertAdjacentHTML('beforeend', html);
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
      this.onSelectAddress,
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
}
