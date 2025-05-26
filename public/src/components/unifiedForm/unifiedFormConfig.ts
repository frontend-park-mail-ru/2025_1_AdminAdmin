import {
  ValidateLogin,
  ValidateName,
  ValidatePassword,
  ValidatePhone,
} from 'doordashers-validation';
import { userStore } from '@store/userStore';
import { FormInputProps } from 'doordashers-ui-kit/types/components/formInput/formInput';
import { ButtonProps } from 'doordashers-ui-kit/types/components/button/button';

export interface I_FormConfig {
  inputs: Record<string, FormInputProps>;
  selects?: {
    code: {
      id: string;
      label: string;
      options: { value: string; text: string }[];
    };
  };
  buttons: {
    submitButton: ButtonProps;
  };
}

const mobileOptions = [
  { value: '7', text: 'RU (+7)' },
  { value: '375', text: 'BY (+375)' },
  { value: '7', text: 'KZ (+7)' },
  { value: '374', text: 'AM (+374)' },
  { value: '996', text: 'KG (+996)' },
  { value: '373', text: 'MD (+373)' },
  { value: '992', text: 'TJ (+992)' },
  { value: '998', text: 'UZ (+998)' },
  { value: '994', text: 'AZ (+994)' },
  { value: '993', text: 'TM (+993)' },
];

export const getFormConfig = (isEditMode: boolean): I_FormConfig => {
  const baseInputs = {
    firstName: {
      id: 'form__input__first-name',
      label: 'Имя',
      name: 'first-name',
      type: 'text',
      placeholder: 'Введите имя',
      validator: ValidateName,
      required: !isEditMode,
      autocomplete: 'given-name',
    },
    secondName: {
      id: 'form__input__second-name',
      label: 'Фамилия',
      name: 'last-name',
      type: 'text',
      placeholder: 'Введите фамилию',
      validator: ValidateName,
      required: !isEditMode,
      autocomplete: 'family-name',
    },
    phoneNumber: {
      id: 'form__input__phone',
      label: 'Телефон',
      name: 'phone',
      type: 'tel',
      placeholder: 'Введите телефон',
      validator: ValidatePhone,
      required: !isEditMode,
      autocomplete: 'tel',
    },
    password: {
      id: 'form__input__password',
      label: 'Пароль',
      name: 'password',
      type: 'password',
      placeholder: 'Введите пароль (не менее 8 символов)',
      validator: ValidatePassword,
      autocomplete: 'new-password',
      required: !isEditMode,
    },
    repeatPassword: {
      id: 'form__input__repeat-password',
      label: 'Повторите пароль',
      name: 'repeat-password',
      type: 'password',
      placeholder: 'Повторите пароль',
      validator: ValidatePassword,
      autocomplete: 'confirm-password',
      required: !isEditMode,
    },
  };

  const registrationInputs = {
    login: {
      id: 'form__input__login',
      label: 'Логин',
      name: 'username',
      type: 'text',
      placeholder: 'Введите логин',
      validator: ValidateLogin,
      required: true,
      autocomplete: 'username',
    },
    ...baseInputs,
  };

  const selects = {
    code: {
      id: 'form__select__phone-code',
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
  };

  const isMobile = window.innerWidth < 600;

  if (isMobile) {
    selects.code.options = mobileOptions;
  }

  const buttons = {
    submitButton: {
      id: 'form__button__submit',
      type: 'submit',
      text: isEditMode ? 'Сохранить' : 'Зарегистрироваться',
      style: 'form__button button_active',
    },
  };

  if (isEditMode) {
    const userData = userStore.getState();
    if (!userData) {
      throw new Error('User data is not ready yet');
    }

    return {
      inputs: {
        ...baseInputs,
        firstName: {
          ...baseInputs.firstName,
          value: userData.first_name,
          placeholder: 'Введите новое имя',
        },
        secondName: {
          ...baseInputs.secondName,
          value: userData.last_name,
          placeholder: 'Введите новую фамилию',
        },
        phoneNumber: {
          ...baseInputs.phoneNumber,
          value: userData.phone_number.slice(1),
          placeholder: 'Введите новый телефон',
        },
        password: {
          ...baseInputs.password,
          placeholder: 'Введите новый пароль (не менее 10 символов)',
        },
        repeatPassword: {
          ...baseInputs.repeatPassword,
          placeholder: 'Повторите новый пароль',
        },
      },
      selects,
      buttons,
    };
  }

  return {
    inputs: registrationInputs,
    selects,
    buttons,
  };
};
