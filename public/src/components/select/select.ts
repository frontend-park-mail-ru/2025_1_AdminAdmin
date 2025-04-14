import template from './select.hbs';

interface SelectProps {
  id: string;
  label: string;
  options: { value: string; text: string }[];
  style?: string;
}

/* Селект (выпадающий список) */
export class Select {
  private parent: HTMLElement; // Родитель (где вызывается)
  private readonly props: SelectProps;

  /* Конструктор */
  constructor(parent: HTMLElement, props: SelectProps) {
    if (!parent) {
      throw new Error('Select: no parent!');
    }
    this.parent = parent;
    this.props = props;
  }

  /* Ссылка на объект */
  get self(): HTMLSelectElement | null {
    return (document.getElementById(this.props.id) as HTMLSelectElement) || null;
  }

  get value(): string | null {
    return this.self?.value || null;
  }

  /* Рендер */
  render = (): void => {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    if (!this.self) {
      throw new Error('Select: invalid self!');
    }
    if (this.props.style) {
      this.self.classList.add(...this.props.style.split(' '));
    }
  };

  /* При удалении объекта */
  remove(): void {
    const selectElement = this.self;
    if (selectElement) {
      selectElement.remove();
    }
  }
}
