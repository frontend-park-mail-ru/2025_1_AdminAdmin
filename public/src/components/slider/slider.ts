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
    this.props.buttonsProps.forEach((props) => {
      // Рендерим кнопки внутрь слайдера
      const ButtonProps = {
        // Добавляем функцию onSubmit кнопке
        ...props,
        onSubmit: () => this.onButtonClick(props.id),
      };
      const ButtonComponent = new Button(this.self, ButtonProps);
      ButtonComponent.render();
      // Добавляем в словарь компонентов
      this.components.buttons.push(ButtonComponent);
    });
    this.updateSlider(this.props.activeButtonIndex);
  }

  /**
   * Логика при нажатии на кнопку слайдера
   * @param clickedButtonId string - id кнопки на которую нажали
   */
  private onButtonClick(clickedButtonId: string): void {
    // Проверяем наличие активной кнопки
    if (!document.getElementById(this.props.buttonsProps[this.props.activeButtonIndex].id)) {
      throw new Error("Slider: Can't find previous active button in props");
    }
    if (!this.components.buttons[this.props.activeButtonIndex]) {
      throw new Error("Slider: Can't find previous active button in button components");
    }
    // Определяем на какую кнопку кликнули и проверяем её наличие
    //console.log(`Slider__onButtonClick__buttonsprops: ${JSON.stringify(this.props.buttonsProps)}`);
    const clickedButtonIndex = this.props.buttonsProps.findIndex(
      (buttonProps) => buttonProps.id === clickedButtonId,
    );
    if (clickedButtonIndex === -1) {
      throw new Error("Slider: Can't find clicked button in props");
    }
    if (!this.components.buttons[clickedButtonIndex]) {
      throw new Error("Slider: Can't find clicked button in button components");
    }
    this.updateSlider(clickedButtonIndex);
  }

  /**
   * Обновляет слайдер
   * @param clickedButtonIndex number - индекс нажатой кнопки (не id)
   */
  private updateSlider(clickedButtonIndex: number): void {
    const previousActiveButtonComponent = this.components.buttons[this.props.activeButtonIndex];
    if (!previousActiveButtonComponent) {
      throw new Error("Slider: Can't find previous active button");
    }
    const clickedButtonComponent = this.components.buttons[clickedButtonIndex];

    if (previousActiveButtonComponent)
      previousActiveButtonComponent.self.classList.remove('button_active');
    if (clickedButtonComponent) clickedButtonComponent.self.classList.add('button_active');

    this.props.activeButtonIndex = clickedButtonIndex;

    // Функция получения координат относительно документа (с learnjavascript)
    function getCoords(element: HTMLElement) {
      // getBoundingClientRect() - возвращает координаты относительно окна (при прокрутке они меняются)
      const box = element.getBoundingClientRect();
      // Возвращаем значения с добавленной прокруткой
      return {
        top: box.top + window.pageYOffset,
        right: box.right + window.pageXOffset,
        bottom: box.bottom + window.pageYOffset,
        left: box.left + window.pageXOffset,
        width: box.width,
        height: box.height,
      };
    }

    const indicatorElement = this.self.querySelector('.slider__indicator') as HTMLElement;
    const clickedButtonRect = getCoords(clickedButtonComponent.self);
    const sliderContainerRect = getCoords(this.self);

    if (clickedButtonRect.width <= 0) {
      console.error('Slider: clicked button width = 0');
    }
    if (clickedButtonRect.height <= 0) {
      console.error('Slider: clicked button height = 0');
    }

    // Обновляем координату индиктора
    indicatorElement.style.transform = `translateX(${clickedButtonRect.left - sliderContainerRect.left}px)`;
    // Обновляем размеры индикатора
    indicatorElement.style.width = `${clickedButtonRect.width}px`;
    indicatorElement.style.height = `${clickedButtonRect.height}px`;
  }

  /**
   * Удаляет слайдер со страницы
   */
  remove(): void {
    const element = this.self;
    while (this.components.buttons.length > 0) {
      // Очищаем кнопки слайдера
      this.components.buttons.pop().remove();
    }
    // Очищаем сам слайдер
    element.remove();
  }
}
