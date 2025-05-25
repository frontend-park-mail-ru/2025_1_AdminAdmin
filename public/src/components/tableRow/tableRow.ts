import template from './tableRow.hbs';

// Интерфейс компонента (нужен для рендера)
export interface Component {
  render(): HTMLElement;
}

// Интерфейс ячейки таблиы (нужен для рендера)
export interface TableCellProps {
  type: 'string' | 'component';
  content: string | Component;
}

// Интерфейс пропсов строки в таблице
export interface TableRowProps {
  id: string;
  cells: TableCellProps[];
  onClick?: () => void;
}

export class TableRow {
  protected parent: HTMLElement;
  protected props: TableRowProps;
  protected clickHandler: (event: Event) => void;

  /**
   * @constructor Создает экземпляр таблицы
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться таблица
   * @param {TableRowProps} props - Словарь данных для определения свойств таблицы
   */
  constructor(parent: HTMLElement, props: TableRowProps) {
    if (!parent) {
      throw new Error('TableRow: no parent!');
    }
    if (!(props.cells.length > 0)) {
      throw new Error('TableRow: empty!');
    }

    this.parent = parent;
    this.props = {
      id: props.id,
      cells: props.cells,
      onClick: props.onClick || undefined,
    };

    this.clickHandler = this.handleClick.bind(this);
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Category: can't find table-row with id=${this.props.id}`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Функция рендера категории на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Category: category template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    // Вставляем компоненты в ячейки (шаблон отрендерил только текст)
    //const cellElements = this.self.querySelectorAll('td');
    this.props.cells.forEach((cell /*i*/) => {
      // В i лежит индекс cell в массиве this.props.cells
      if (cell.type === 'component') {
        //const cellElement = cellElements[i] as HTMLElement;
        const cellComponent = cell.content as Component;
        cellComponent.render();
      }
    });
    this.self.addEventListener('click', this.clickHandler);
  }

  /**
   * Обработчик нажатия на строку таблицы
   * @private
   */
  handleClick(event: Event): void {
    event.preventDefault();
    if (this.props.onClick !== undefined) {
      this.props.onClick();
    }
  }
}
