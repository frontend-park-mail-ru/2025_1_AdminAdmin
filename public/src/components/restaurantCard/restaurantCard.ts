import { router } from '@modules/routing';

import template from './restaurantCard.hbs';

import { BaseRestaurant } from '@myTypes/restaurantTypes';
import { StarsWidget } from '@components/starsWidget/starsWidget';

const descriptionColors: Record<string, string> = {
  'Шеф рекомендует': 'description--red',
  'Горячее предложение': 'description--orange',
  'Сезонное меню': 'description--darkgreen',
  'Успей заказать': 'description--blue',
  'Тренд недели': 'description--purple',
  Новинка: 'description--red',
  'Хит дня': 'description--orange',
  'Любимое меню': 'description--darkgreen',
  Эксклюзив: 'description--purple',
  'В тренде': 'description--blue',
  Суперцена: 'description--red',
  'Идеальный обед': 'description--orange',
  'Огонь!': 'description--red',
};

/**
 * Класс карточки ресторана
 */
export class RestaurantCard {
  private parent: HTMLElement; // Родитель (где вызывается)
  private readonly props: BaseRestaurant;
  private readonly isSearchCard: boolean;
  private stars: StarsWidget;
  /**
   * Создает экземпляр карточки ресторана.
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться карточка.
   * @param {Object} props - Словарь данных для определения свойств карточки
   * @param isSearchCard
   */
  constructor(parent: HTMLElement, props: BaseRestaurant, isSearchCard = false) {
    this.parent = parent;
    this.props = props;
    this.isSearchCard = isSearchCard;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    return document.getElementById(this.props.id) as HTMLElement;
  }

  /**
   * Обработчик нажатия на карточку.
   * @private
   */
  private handleClick = () => {
    router.goToPage('restaurantPage', this.props.id);
  };

  /**
   * Отображает карточку на странице.
   * @param pushDirection {"beforebegin" | "afterbegin" | "beforeend" | "afterend"} - Определяет, куда вставлять карточку относительно родителя.
   */
  render(pushDirection: InsertPosition = 'beforeend') {
    const name = this.props.name;
    const nameLength = name.length;

    let cardText = '';

    if (nameLength <= 10) {
      const shortVariants = [
        `Ресторан ${name} — уютная атмосфера`,
        `Добро пожаловать в ${name}`,
        `${name}: быстро, вкусно, рядом`,
        `${name} — еда, которая радует`,
        `Попробуй ${name} сегодня`,
        `${name} — вкусный выбор`,
      ];
      cardText = shortVariants[Math.floor(Math.random() * shortVariants.length)];
    } else if (nameLength <= 20) {
      const mediumVariants = [
        `Попробуйте ${name} — вкус и качество`,
        `${name} приглашает на ужин`,
        `Откройте для себя ${name}`,
        `${name} — для настоящих гурманов`,
        `${name} — идеален для обеда`,
        `Лучшее меню в ${name}`,
      ];
      cardText = mediumVariants[Math.floor(Math.random() * mediumVariants.length)];
    } else {
      const longVariants = [
        `${name}: лучшие блюда рядом с вами`,
        `${name} — гастрономическое приключение`,
        `В ${name} каждый найдет свое любимое`,
        `Откройте новые вкусы в ${name}`,
        `${name}: кулинария с характером`,
        `${name} — уют, сервис, вкус`,
      ];
      cardText = longVariants[Math.floor(Math.random() * longVariants.length)];
    }

    const html = template({ ...this.props, isSearchCard: this.isSearchCard, cardText });
    this.parent.insertAdjacentHTML(pushDirection, html);

    const descriptionElem = this.self.querySelector(
      '.restaurant__card__description',
    ) as HTMLElement;

    if (descriptionElem) {
      const desc = descriptionElem.textContent?.trim() || '';
      const className = descriptionColors[desc] || 'description--green';
      descriptionElem.classList.add(className);
    }

    if (this.isSearchCard) this.self.classList.add('restaurant__search-card');
    this.self.addEventListener('click', this.handleClick);

    const starsContainer: HTMLDivElement = this.self.querySelector(
      '.restaurant__card__content__title',
    );
    this.stars = new StarsWidget(starsContainer, this.props.rating, null, false, true);
    this.stars.render();
  }

  /**
   * Удаляет карточку ресторана со страницы и снимает обработчики событий.
   */
  remove() {
    if (!this.self) {
      return;
    }
    try {
      this.self.removeEventListener('click', this.handleClick);
      this.stars.remove();
    } catch (error) {
      console.error(error);
    }
  }
}
