import { ProfileTableRow } from '../profileTableRow/profileTableRow';

import template from './profileTable.hbs';
import { I_OrderResponse } from '@myTypes/orderTypes';

export class ProfileTable {
  protected parent: HTMLElement;
  headers: string[];
  orders: I_OrderResponse[];
  protected rowsList: ProfileTableRow[];

  /**
   * @constructor Создает экземпляр таблицы
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться таблица
   * @param orders
   */
  constructor(parent: HTMLElement, orders: I_OrderResponse[]) {
    if (!parent) {
      throw new Error('ProfileTable: no parent!');
    }

    this.parent = parent;
    this.headers = ['Статус', 'Дата', 'Сумма', 'Ресторан'];
    this.orders = orders;
    this.rowsList = [];
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    const element = this.parent.querySelector('.profile-table');
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
    const html = template(this.headers);
    this.parent.insertAdjacentHTML('beforeend', html);
    // Заполняем
    const tbodyElement = this.self.querySelector('tbody') as HTMLElement;
    this.orders.forEach((order) => {
      const rowComponent = new ProfileTableRow(tbodyElement, order);
      rowComponent.render();
      this.rowsList.push(rowComponent);
    });
  }

  /**
   * Удаляет таблицу со страницы профиля
   */
  remove(): void {
    const element = this.self;

    this.rowsList.forEach((rowEl) => {
      rowEl.remove();
    });

    element.remove();
  }
}
