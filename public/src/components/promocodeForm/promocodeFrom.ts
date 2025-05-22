import { FormInput } from '../formInput/formInput';
import { Button } from '../button/button';

import template from './promocodeForm.hbs';

// Пропсы промокода (можно использовать и для карточки в профиле)
export interface PromocodeProps {
  id: string; // Идентификатор промокода
  promocodeText: string; // Текст промокода
  discountSize: number; // Размер скидки
  expiresAt?: string; // Время, когда истекает
}

/** Класс формы промокода */
export class PromocodeForm {
  protected parent: HTMLElement;
  protected ApplyPromocodeCallback: (promocode: PromocodeProps) => void; // Калбек функция при применении промокода (для изменения цены на странице)
  protected components: {
    promocodeInput: FormInput;
    submitButton: Button;
  };
  protected isHiden = true; // Спрятана ли форма (вместо неё ссылка для её открытия)
  protected isDisabledd = false; // Если применили промокод, то убираем кнопку и замораживаем инпут
  protected promocodeList: PromocodeProps[] = []; // Список валидных промокодов

  /**
   * Создает экземпляр формы промокода
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться форма промокода
   */
  constructor(parent: HTMLElement, callback: (promocode: PromocodeProps) => void) {
    if (!parent) {
      throw new Error('PromocodeForm: no parent!');
    }
    this.parent = parent;
    this.ApplyPromocodeCallback = callback;
  }

  /**
   * Ссылка на объект
   * @returns {HTMLElement} - ссылка на объект
   */
  get self(): HTMLButtonElement | null {
    const element = document.querySelector('.promocode-form');
    if (!element) {
      throw new Error(`Error: can't find promocode-form`);
    }
    return element as HTMLButtonElement;
  }

  /**
   * Рендерит форму ввода промокода в родительский элемент
   */
  render(): void {
    if (!template) {
      throw new Error(`Error: can't find promocode-form template`);
    }
    const html = template({ isHiden: this.isHiden });
    this.parent.insertAdjacentHTML('beforeend', html);

    const promocodeFormLinkElement = this.self.querySelector(
      '.promocode-form__link',
    ) as HTMLElement;
    promocodeFormLinkElement.addEventListener('click', () => this.onLinkClick());

    const promocodeFormBodyElement = this.self.querySelector(
      '.promocode-form__body',
    ) as HTMLElement;
    // Создаем и рендерим кнопку активации промокода
    this.components.submitButton = new Button(promocodeFormBodyElement, {
      id: 'promocode-form__submit-button',
      text: 'Применить',
      onSubmit: () => this.onButtonClick(),
    });
    this.components.submitButton.render();
    // Создаем и рендерим поле ввода промокода
    this.components.promocodeInput = new FormInput(promocodeFormBodyElement, {
      id: 'promocode-form__input',
      label: 'Промокод',
      placeholder: 'Введите промокод',
      validator: (value: string) => this.validatePromocode(value),
      //  Из formInput: validator?: (value: string) => { result: boolean; message?: string }; // Функция валидации
    });
    this.components.promocodeInput.render();
  }

  /**
   * Удаляет форму ввода промокода
   */
  remove(): void {
    const promocodeFormElement = this.self;
    this.components.promocodeInput.remove();
    this.components.submitButton.remove();
    const promocodeFormLinkElement = this.self.querySelector(
      '.promocode-form__link',
    ) as HTMLElement;
    promocodeFormLinkElement.removeEventListener('click', () => this.onLinkClick());
    promocodeFormElement.remove();
  }

  /**
   * Функция нажатия на ссылку для открытия формы промокода
   */
  onLinkClick(): void {
    const promocodeFormLinkElement = this.self.querySelector(
      '.promocode-form__link',
    ) as HTMLElement;
    const promocodeFormBodyElement = this.self.querySelector(
      '.promocode-form__body',
    ) as HTMLElement;
    promocodeFormLinkElement.classList.add('hidden');
    promocodeFormBodyElement.classList.remove('hidden');
    // Удаляем обработчик после первого вызова
    promocodeFormLinkElement.removeEventListener('click', () => this.onLinkClick());
  }

  /**
   * Функция нажатия на кнопку отправки промокода
   */
  onButtonClick(): void {
    this.promocodeList = [
      {
        id: 'promocode-1',
        promocodeText: 'promocode1',
        discountSize: 1,
        expiresAt: '31.12.25 23:59',
      },
      {
        id: 'promocode-2',
        promocodeText: 'promocode2',
        discountSize: 2,
        expiresAt: '31.12.25 23:59',
      },
      {
        id: 'promocode-3',
        promocodeText: 'promocode3',
        discountSize: 3,
        expiresAt: '31.12.25 23:59',
      },
      {
        id: 'promocode-4',
        promocodeText: 'promocode4',
        discountSize: 4,
        expiresAt: '31.12.25 23:59',
      },
      {
        id: 'promocode-5',
        promocodeText: 'promocode5',
        discountSize: 5,
        expiresAt: '31.12.25 23:59',
      },
    ]; // Пока моки

    const isValid = this.components.promocodeInput.checkValue();

    if (typeof isValid === 'string' || !isValid) {
      // Если вернулась строчка-ошибки
      this.components.promocodeInput.setError(
        typeof isValid === 'string' ? isValid : 'Неверный промокод',
      );
      return;
    }
    // Промокод валиден — получаем его из списка
    const value = this.components.promocodeInput.value; // Значение в инпуте для промокода
    const appliedPromocode = this.promocodeList.find(
      (promocod) => promocod.promocodeText === value,
    );

    if (!appliedPromocode) {
      // Если промокод не найден, то выдаем ошибку на formInput
      this.components.promocodeInput.setError('Промокод не найден');
      return;
    }

    this.ApplyPromocodeCallback(appliedPromocode); // Если нашли промокод, то вызываем калбек куда передаем примененный промокод
    // Отключаем форму после применения промокода и прячем кнопку
    this.components.promocodeInput.disable();
    this.components.submitButton.hide();
  }

  /**
   * Функция проверки промокода
   */
  validatePromocode(value: string): { result: boolean; message?: string } {
    const promocode = this.promocodeList.some((promocode) => promocode.promocodeText === value);
    if (!promocode) {
      // Если ввели неверный текст промокода
      return {
        result: false,
        message: 'Неверный промокод',
      };
    }
    return { result: true };
  }
}
