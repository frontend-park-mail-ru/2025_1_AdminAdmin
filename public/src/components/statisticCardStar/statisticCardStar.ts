import template from './statisticCardStar.hbs';

export interface StatisticCardStarProps {
  id: string; // Уникальный идентификатор
  average: number; // Среднее кол-во звезд
  amount: number; // Общее кол-во ответов
  answers: { value: string; percentage?: number; amount: number }[];
}

export class StatisticCardStar {
  protected parent: HTMLElement;
  protected props: StatisticCardStarProps;

  /**
   * Создает экземпляр карточки статистики звезд
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться карточка
   * @param props - Словарь данных для определения свойств карточки
   */
  constructor(parent: HTMLElement, props: StatisticCardStarProps) {
    if (!parent) {
      throw new Error('StatisticCardStar: no parent!');
    }
    this.parent = parent;
    this.props = {
      id: props.id,
      average: props.average,
      amount: props.amount,
      answers: props.answers,
    };
    this.props.answers.forEach((answer) => {
      if (!answer.percentage) {
        answer.percentage = answer.amount / this.props.amount;
      }
    });
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement | null {
    const element = document.getElementById(this.props.id);
    if (!element) {
      throw new Error(`Error: can't find StatisticCardStar with id ${this.props.id}`);
    }
    return element;
  }

  /**
   * Рендерит карточку статистики в родительский элемент.
   */
  render(): void {
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
  }

  /**
   * Удаляет карточку со страницы.
   */
  remove(): void {
    this.self.remove();
  }
}
