import { TableRow, TableRowProps, Component } from '../tableRow/tableRow';

import template from './table.hbs';

// Интерфейс таблицы
export interface TableProps {
  id: string;
  headers?: Array<string>;
  rows?: Array<{
    id: string;
    cells: Array<string | Component>;
    onClick?: () => void;
  }>;
  onRowClick?: () => void;
}

export class Table {
  protected parent: HTMLElement;
  protected props: TableProps;
  protected rowsList: Array<TableRow>;

  /**
   * @constructor Создает экземпляр таблицы
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться таблица
   * @param {CategoriesProps} props - Словарь данных для определения свойств таблицы
   */
  constructor(parent: HTMLElement, props: TableProps) {
    if (!parent) {
      throw new Error('Table: no parent!');
    }
    if (document.getElementById(props.id)) {
      throw new Error('Table: this id is already used!');
    }
    if (props.rows.length > 0) {
      console.log(`props rows: ${JSON.stringify(props.rows)}`);
      props.rows.forEach((rowProps) => {
        // Добавляем в компонент только непустые строки
        if (rowProps.cells.length > 0) {
          // Отбрасывает [] (если передали [['hello'], []] получим [['hello']])
          this.props.rows.push(rowProps);
        }
      });
      console.log(`table rows: ${JSON.stringify(this.props.rows)}`);
    }
    if (!(props.headers.length > 0 || this.props.rows.length > 0)) {
      throw new Error('Table: must have rows or header!');
    }

    this.parent = parent;
    this.props = {
      id: props.id,
      headers: props.headers || undefined,
      onRowClick: props.onRowClick || undefined,
      // Строки таблицы добавили выше
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find table`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Отображает таблицу на странице.
   */
  render(): void {
    if (!template) {
      throw new Error('Error: table template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    // Заполняем
    this.props.rows.forEach((props) => {
      console.log(`Создаем новую строчку с пропсами ${JSON.stringify(props)}`);
      const rowProps = {
        id: props.id,
        onClick: props.onClick,
        cells: props.cells.map((cell) => {
          if (typeof cell === 'string') {
            return { type: 'string', content: cell };
          } else {
            return { type: 'component', content: cell };
          }
        }),
      } as TableRowProps;
      const rowComponent = new TableRow(this.self, rowProps);
      rowComponent.render();
      this.rowsList.push(rowComponent);
    });
  }
}
