import { ValidateName, ValidatePassword, ValidatePhone } from '@modules/validation';

import { FormInputProps } from '../formInput/formInput';
import { ButtonProps } from '../button/button';

export interface ProfileFormConfig {
  id: string;
  inputs: {
    firstName: FormInputProps;
    secondName: FormInputProps;
    phoneNumber: FormInputProps;
    password: FormInputProps;
    repeatPassword: FormInputProps;
  };
  buttons: {
    submitButton: ButtonProps;
  };
}

// Конфиг формы редактирования профиля
export const config: ProfileFormConfig = {
  id: 'profile-edit-form',
  inputs: {
    firstName: {
      id: 'profile-edit-form__first-name__input',
      label: 'Имя',
      placeholder: 'Введите новое имя',
      validator: ValidateName,
    },
    secondName: {
      id: 'profile-edit-form__second-name__input',
      label: 'Фамилия',
      placeholder: 'Введите новую фамилию',
      validator: ValidateName,
    },
    phoneNumber: {
      id: 'profile-edit-form__phone-number__input',
      label: 'Телефон',
      placeholder: 'Введите новый телефон',
      validator: ValidatePhone,
    },
    password: {
      id: 'profile-edit-form__password__input',
      label: 'Пароль',
      type: 'password',
      placeholder: 'Введите новый пароль (не менее 10 символов)',
      validator: ValidatePassword,
    },
    repeatPassword: {
      id: 'profile-edit-form__password-repeat__input',
      label: 'Повтор пароля',
      type: 'password',
      placeholder: 'Повторите новый пароль',
      validator: ValidatePassword,
    },
  },
  /*
    selects: {
        code: {
            id: 'profile-edit-form__phone-code',
            label: 'Код страны',
            options: [
                { value: '7', text: 'Россия (+7)' },
                { value: '375', text: 'Беларусь (+375)' },
                { value: '7', text: 'Казахстан (+7)' },
                { value: '374', text: 'Армения (+374)' },
                { value: '996', text: 'Кыргызстан (+996)' },
                { value: '373', text: 'Молдова (+373)' },
                { value: '992', text: 'Таджикистан (+992)' },
                { value: '998', text: 'Узбекистан (+998)' },
                { value: '994', text: 'Азербайджан (+994)' },
                { value: '993', text: 'Туркменистан (+993)' },
            ],
        },
    },
    */
  buttons: {
    submitButton: {
      id: 'profile-edit-form__submit-button',
      text: 'Сохранить',
      style: 'form__button button_active',
    },
  },
};
