import { ProfileTableRow, ProfileTableRowProps } from '../profileTableRow/profileTableRow';

import template from './profileTable.hbs';

// Интерфейс таблицы
export interface ProfileTableProps {
  id: string;
  headers?: string[];
  rows: ProfileTableRowProps[];
  onRowClick?: () => void; // Общая фукнция при нажатии на строку (чтобы не писать каждый раз)
}

export class ProfileTable {
  protected parent: HTMLElement;
  protected props: ProfileTableProps;
  protected rowsList: ProfileTableRow[];

  /**
   * @constructor Создает экземпляр таблицы
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться таблица
   * @param {CategoriesProps} props - Словарь данных для определения свойств таблицы
   */
  constructor(parent: HTMLElement, props: ProfileTableProps) {
    if (!parent) {
      throw new Error('ProfileTable: no parent!');
    }
    if (document.getElementById(props.id)) {
      throw new Error('ProfileTable: this id is already used!');
    }
    if (props.rows.length <= 0) {
      throw new Error('ProfileTable: no rows!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      headers: ['Статус', 'Дата', 'Сумма', 'Ресторан'],
      rows: props.rows,
      //onRowClick: () => {}//'TODO: Сделать переход на страницу заказа',
    };
    this.rowsList = [];
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find profile-table`);
    }
    return element as HTMLElement;
    // Возвращаем as HTMLElement потому что querySelector возвращает null или HTMLElement, но мы сделали проверку null
  }

  /**
   * Отображает таблицу на странице.
   */
  render(): void {
    if (!template) {
      throw new Error('Error: profile-table template not found');
    }
    // Рендерим шаблончик с данными
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    // Заполняем
    const tbodyElement = this.self.querySelector('tbody') as HTMLElement;
    this.props.rows.forEach((props) => {
      const rowProps = {
        // Добавляем в пропсы функцию onRowClick если не указано в пропсах строки
        ...props,
        onClick: props.onClick || this.props.onRowClick || undefined,
        // Присваиваем функцию при нажатии на строку: Сначала если передали в пропсах строки, потом если передали в пропсах таблицы, иначе ничего
      } as ProfileTableRowProps;
      const rowComponent = new ProfileTableRow(tbodyElement, rowProps);
      rowComponent.render();
      this.rowsList.push(rowComponent);
    });
  }

  /**
   * Удаляет таблицу со страницы профиля
   */
  remove(): void {
    const element = this.self;
    while (this.rowsList.length > 0) {
      this.rowsList.pop().remove();
    }
    element.remove();
  }
}
