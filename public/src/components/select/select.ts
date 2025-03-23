import template from './select.hbs';

/* Селект (выпадающий список) */
export class Select {
  private parent: HTMLElement; // Родитель (где вызывается)
  private props = {
    id: '', // Id для идентификации
    label: '', // Метка для отображения
    options: [] as string[], // Массив опций
    style: '', // Дополнительный стиль css
  };

  /* Конструктор */
  constructor(
    parent: HTMLElement,
    props: {
      id: string;
      label: string;
      options: string[];
      style?: string;
    },
  ) {
    if (!parent) {
      throw new Error('Select: no parent!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      label: props.label,
      options: props.options,
      style: props.style || '',
    };
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
