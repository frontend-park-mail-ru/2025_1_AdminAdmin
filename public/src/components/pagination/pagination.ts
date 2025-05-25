import { Button } from 'doordashers-ui-kit';
import template from './pagination.hbs';

export class Pagination {
  private paginationButtons: Button[] = [];
  private readonly parent: HTMLElement;
  private readonly totalPages: number;
  private currentPage = 1;
  private readonly onButtonClick: (pageNumber: number) => void;

  constructor(
    parent: HTMLElement,
    totalPages: number,
    onButtonClick: (pageNumber: number) => void,
  ) {
    this.parent = parent;
    this.totalPages = totalPages;
    this.onButtonClick = onButtonClick;
  }

  get self(): HTMLDivElement {
    return this.parent.querySelector('.pagination');
  }

  render() {
    this.clear();

    const html = template();
    this.parent.insertAdjacentHTML('beforeend', html);

    this.renderNavigationButtons();
    this.renderPageButtons();
    this.renderEndButtons();
  }

  private clear() {
    this.paginationButtons.forEach((button) => button.remove());
    this.paginationButtons = [];
  }

  private renderNavigationButtons() {
    if (this.currentPage > 1) {
      if (window.innerWidth > 700) {
        this.addButton('beg-button', '«', () => this.goTo(1));
        this.addButton('prev-button', '< Назад', this.prev);
      }

      if (this.currentPage > 2) {
        this.addButton('first-button', '1', () => this.goTo(1));
        if (this.currentPage > 3) {
          this.addButton('more-beg-button', '...');
        }
      }
    }
  }

  private renderPageButtons() {
    let beforePage = this.currentPage - 1;
    let afterPage = this.currentPage + 1;

    if (this.currentPage === this.totalPages) beforePage -= 2;
    else if (this.currentPage === this.totalPages - 1) beforePage -= 1;

    if (this.currentPage === 1) afterPage += 2;
    else if (this.currentPage === 2) afterPage += 1;

    for (let i = beforePage; i <= afterPage; i++) {
      if (i < 1 || i > this.totalPages) continue;

      this.addButton(
        `page-button-${i}`,
        i.toString(),
        () => this.goTo(i),
        this.currentPage === i ? 'button_active' : undefined,
      );
    }
  }

  private renderEndButtons() {
    if (this.currentPage < this.totalPages - 1) {
      if (this.currentPage < this.totalPages - 2) {
        this.addButton('more-next-button', '...');
      }

      this.addButton(`page-button-${this.totalPages}`, this.totalPages.toString(), () =>
        this.goTo(this.totalPages),
      );
    }

    if (this.currentPage < this.totalPages && window.innerWidth > 700) {
      this.addButton('next-button', 'Далее >', this.next);
      this.addButton('end-button', '»', () => this.goTo(this.totalPages));
    }
  }

  private addButton(id: string, text: string, onSubmit?: () => void, style?: string) {
    const btn = new Button(this.self, { id, text, onSubmit, style });
    btn.render();
    this.paginationButtons.push(btn);
  }

  private next = () => {
    this.currentPage++;

    const lastPage = this.currentPage > this.totalPages;
    if (lastPage) {
      this.currentPage--;
    }

    this.render();
    this.onButtonClick(this.currentPage);
  };

  private prev = () => {
    this.currentPage--;

    const firstPage = this.currentPage < 1;

    if (firstPage) {
      this.currentPage++;
    }

    this.render();
    this.onButtonClick(this.currentPage);
  };

  private goTo = (page: number) => {
    if (page < 1) {
      page = 1;
    }
    this.currentPage = +page;

    if (page > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.render();
    this.onButtonClick(this.currentPage);
  };

  remove() {
    this.paginationButtons.forEach((button: Button) => {
      button.remove();
    });

    this.paginationButtons = [];

    const pagination: HTMLDivElement = this.parent.querySelector('.pagination-wrapper');
    pagination?.remove();
  }
}
