import { Button, ButtonProps } from '@components/button/button';

import template from './slider.hbs';

export interface SliderProps {
  // Идентификатор сделал необязательным. Если не передали, то ищем по классу. При рендере, если уже есть, то ошибка
  id?: string; // Идентификатор слайдера
  buttonsProps: ButtonProps[]; // Пропсы для кнопок
  activeButtonIndex?: number; // Индекс активной кнопки (не id)
}

/**
 * Класс слайдера (кнопок)
 */
export class Slider {
  private parent: HTMLElement;
  private props: SliderProps;
  private components: { buttons: Button[] } = { buttons: [] };

  /**
   * Создает экземпляр слайдера
   * @constructor
   * @param {HTMLElement} parent - Родительский элемент, в который будет рендериться слайдер
   * @param cardsComponent
   */
  constructor(parent: HTMLElement, props: SliderProps) {
    if (props.buttonsProps.length <= 0) {
      throw new Error('Slider: no buttons props to create slider');
    }
    this.parent = parent;
    this.props = {
      id: props.id ?? undefined,
      buttonsProps: props.buttonsProps,
      activeButtonIndex: props.activeButtonIndex ?? 0,
    };
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLElement {
    let element: HTMLElement | null = null;
    if (this.props.id) {
      element = document.getElementById(this.props.id);
    } else {
      element = document.querySelector('.slider');
    }
    if (!element) {
      throw new Error(`Error: can't find slider`);
    }
    return element as HTMLElement;
  }

  /**
   * Отображает слайдер на странице
   */
  render(): void {
    if (!template) {
      throw new Error('Error: slider template not found');
    }
    if (document.getElementById(this.props.id)) {
      throw new Error(`Slider: this id (${this.props.id}) is already in use`);
    }
    const html = template(this.props);
    this.parent.insertAdjacentHTML('beforeend', html);
    this.props.buttonsProps.forEach((props, index) => {
      // Рендерим кнопки внутрь слайдера
      const ButtonComponent = new Button(this.self, props);
      ButtonComponent.render();
      // Добавляем на кнопку листенер для изменения положения индикатора
      const ButtonElement = ButtonComponent.self;
      ButtonElement.addEventListener('click', () => this.updateSlider(index)); // Листенер для анимации (индикатора)
      // Добавляем в словарь компонентов
      this.components.buttons.push(ButtonComponent);
    });
    this.updateSlider(this.props.activeButtonIndex);
  }

  /**
   * Обновляет слайдер, делает активной кнопку указанную в параметрах
   * @param clickedButtonIndex number - индекс нажатой кнопки (не id)
   */
  updateSlider(clickedButtonIndex: number): void {
    const previousActiveButtonComponent = this.components.buttons[this.props.activeButtonIndex];
    if (!previousActiveButtonComponent) {
      throw new Error(
        `Slider: Can't find previous active button (index=${this.props.activeButtonIndex})`,
      );
    }

    const clickedButtonComponent = this.components.buttons[clickedButtonIndex];
    if (!clickedButtonComponent) {
      throw new Error(`Slider: Can't find active button (index=${clickedButtonIndex})`);
    }

    // Удаляю активность с прошлой кнопки
    previousActiveButtonComponent.self.classList.remove('button_active');
    // Добавляю активность на навую кнопку
    clickedButtonComponent.self.classList.add('button_active');

    this.props.activeButtonIndex = clickedButtonIndex;

    const indicatorElement = this.self.querySelector('.slider__indicator') as HTMLElement;
    // Вычисляем процентные значения
    const buttonWidthPercent = 100 / this.components.buttons.length; // Кнопки одинаковой ширины
    const buttonPositionPercent = 100 * clickedButtonIndex; // Тк translateX зависит от ширины элемента (индикатора)
    // Обновляем координату и размеры индикатора в процентах
    indicatorElement.style.transform = `translateX(${buttonPositionPercent}%)`;
    indicatorElement.style.width = `${buttonWidthPercent}%`;
  }

  /**
   * Удаляет слайдер со страницы
   */
  remove(): void {
    const element = this.self;
    this.components.buttons.forEach((ButtonComponent, index) => {
      // Очищаем кнопки слайдера
      const ButtonElement = ButtonComponent.self;
      ButtonElement.removeEventListener('click', () => this.updateSlider(index));
      ButtonComponent.remove();
    });
    // Очищаем сам слайдер
    element.remove();
  }
}
