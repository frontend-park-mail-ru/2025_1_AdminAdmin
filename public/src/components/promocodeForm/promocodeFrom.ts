import { FormInput } from 'doordashers-ui-kit';
import { Button } from 'doordashers-ui-kit';

import template from './promocodeForm.hbs';
import { userStore } from '@store/userStore';
import { AppPromocodeRequests } from '@modules/ajax';

// Пропсы промокода (можно использовать и для карточки в профиле)
export interface PromocodeProps {
  id: string; // Идентификатор промокода
  promocode: string; // Текст промокода
  discount: number; // Размер скидки
  expires_at?: string; // Время, когда истекает
}

/** Класс формы промокода */
export class PromocodeForm {
  protected parent: HTMLElement;
  protected ApplyPromocodeCallback: (discount: number) => void; // Калбек функция при применении промокода (для изменения цены на странице)
  protected components: {
    promocodeInput: FormInput;
    submitButton: Button;
  };
  private disabled: boolean;
  protected isHidden = true; // Спрятана ли форма (вместо неё ссылка для её открытия)
  protected promocodeList: PromocodeProps[] = []; // Список валидных промокодов
  private ClearPromocodeCallback: () => void;

  /**
   * Создает экземпляр формы промокода
   * @constructor
   * @param parent - Родительский элемент, в который будет рендериться форма промокода
   * @param onPromocodeApply
   * @param onPromocodeClear
   * @param disabled
   */
  constructor(
    parent: HTMLElement,
    onPromocodeApply: (discount: number) => void,
    onPromocodeClear: () => void,
    disabled = false,
  ) {
    if (!parent) {
      throw new Error('PromocodeForm: no parent!');
    }
    this.parent = parent;
    this.disabled = disabled;
    this.ApplyPromocodeCallback = onPromocodeApply;
    this.ClearPromocodeCallback = onPromocodeClear;
    this.components = {} as any;
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
    const html = template({ isHidden: this.isHidden });
    this.parent.insertAdjacentHTML('beforeend', html);

    const promocodeFormLinkElement = this.self.querySelector(
      '.promocode-form__link',
    ) as HTMLElement;
    promocodeFormLinkElement.addEventListener('click', this.onLinkClick);

    const promocodeFormBodyElement = this.self.querySelector(
      '.promocode-form__body',
    ) as HTMLElement;

    const activePromocode = userStore.getActivePromocode();
    // Создаем и рендерим поле ввода промокода
    this.components.promocodeInput = new FormInput(promocodeFormBodyElement, {
      id: 'promocode-form__input',
      placeholder: 'Ваш промокод',
      type: 'text',
      value: activePromocode,
      required: true,
      movePlaceholderOnInput: true,
      onEnter: this.onButtonClick,
      onClearClick: () => {
        userStore.setPromocode('');
        this.enable();
        this.components.submitButton.disable();
        this.ClearPromocodeCallback();
      },
      onInput: () => {
        if (!this.components.promocodeInput.value) {
          this.components.submitButton.disable();
        } else {
          this.components.submitButton.enable();
        }
      },
    });
    this.components.promocodeInput.render();
    // Создаем и рендерим кнопку активации промокода
    this.components.submitButton = new Button(promocodeFormBodyElement, {
      id: 'promocode-form__submit-button',
      text: 'Применить',
      style: 'dark fit',
      disabled: true,
      onSubmit: () => this.onButtonClick(),
    });
    this.components.submitButton.render();

    if (activePromocode) {
      this.onButtonClick();
      this.onLinkClick();
    }

    if (this.disabled) {
      this.disable();
    }

    this.onLinkClick();
  }

  disable() {
    this.components.promocodeInput.disable();
    this.components.promocodeInput.setPlaceholder('Промокод применен');
    this.components.submitButton.hide();
  }

  enable() {
    this.components.promocodeInput.enable();
    this.components.submitButton.show();
    this.components.promocodeInput.setPlaceholder('Введите промокод');
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
    promocodeFormLinkElement.removeEventListener('click', this.onLinkClick);
    promocodeFormElement.remove();
  }

  /**
   * Функция нажатия на ссылку для открытия формы промокода
   */
  onLinkClick = () => {
    const promocodeFormIcon = this.parent.querySelector(
      '#promocode-form-arrow',
    ) as HTMLImageElement;
    const promocodeFormBodyElement = this.self.querySelector(
      '.promocode-form__body',
    ) as HTMLElement;

    const isHidden =
      promocodeFormBodyElement.style.display === 'none' ||
      getComputedStyle(promocodeFormBodyElement).display === 'none';

    if (isHidden) {
      promocodeFormBodyElement.style.display = 'flex';
      promocodeFormIcon.style.transform = 'scaleY(-1)';
    } else {
      promocodeFormBodyElement.style.display = 'none';
      promocodeFormIcon.style.transform = 'scaleY(1)';
    }
  };

  /**
   * Функция нажатия на кнопку отправки промокода
   */
  onButtonClick = async () => {
    this.components.promocodeInput.clearError();

    const promocode = this.components.promocodeInput.value; // Значение в инпуте для промокода

    try {
      const discount = await AppPromocodeRequests.CheckPromocode(promocode);
      userStore.setPromocode(promocode);
      this.ApplyPromocodeCallback(discount);
      this.disable();
    } catch {
      this.components.promocodeInput.setError('Промокод не найден');
    }
  };

  /**
   * Функция нажатия на кнопку отправки промокода
   */
  /*  onButtonClick = () => {
    this.promocodeList = [
      {
        id: '1',
        promocode: '1',
        discount: 1,
        expires_at: '31.12.25 23:59',
      },
      {
        id: 'promocode-2',
        promocode: 'promocode2',
        discount: 2,
        expires_at: '31.12.25 23:59',
      },
      {
        id: 'promocode-3',
        promocode: 'promocode3',
        discount: 3,
        expires_at: '31.12.25 23:59',
      },
      {
        id: 'promocode-4',
        promocode: 'promocode4',
        discount: 4,
        expires_at: '31.12.25 23:59',
      },
      {
        id: 'promocode-5',
        promocode: 'promocode5',
        discount: 5,
        expires_at: '31.12.25 23:59',
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
    const appliedPromocode = this.promocodeList.find((promocod) => promocod.promocode === value);

    if (!appliedPromocode) {
      // Если промокод не найден, то выдаем ошибку на formInput
      this.components.promocodeInput.setError('Промокод не найден');
      return;
    }

    this.ApplyPromocodeCallback(0.1); // Если нашли промокод, то вызываем калбек куда передаем примененный промокод
    // Отключаем форму после применения промокода и прячем кнопку
    this.components.promocodeInput.disable();
    this.components.submitButton.hide();
  }*/
}
