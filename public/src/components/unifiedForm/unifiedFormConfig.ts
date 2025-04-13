import { ValidateLogin, ValidateName, ValidatePassword, ValidatePhone } from '@modules/validation';
import { FormInputProps } from '@components/formInput/formInput';
import { ButtonProps } from '@components/button/button';
import { userStore } from '@store/userStore';

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

export const getFormConfig = (isEditMode: boolean): I_FormConfig => {
  const baseInputs = {
    firstName: {
      id: 'form__input__first-name',
      label: 'Имя',
      placeholder: 'Введите имя',
      validator: ValidateName,
      required: !isEditMode,
    },
    secondName: {
      id: 'form__input__second-name',
      label: 'Фамилия',
      placeholder: 'Введите фамилию',
      validator: ValidateName,
      required: !isEditMode,
    },
    phoneNumber: {
      id: 'form__input__phone',
      label: 'Телефон',
      placeholder: 'Введите телефон',
      type: 'phone',
      validator: ValidatePhone,
      required: !isEditMode,
    },
    password: {
      id: 'form__input__password',
      label: 'Пароль',
      type: 'password',
      placeholder: 'Введите пароль (не менее 10 символов)',
      validator: ValidatePassword,
      required: !isEditMode,
    },
    repeatPassword: {
      id: 'form__input__repeat-password',
      label: 'Повторите пароль',
      type: 'password',
      placeholder: 'Повторите пароль',
      validator: ValidatePassword,
      required: !isEditMode,
    },
  };

  const registrationInputs = {
    ...baseInputs,
    login: {
      id: 'form__input__login',
      label: 'Логин',
      placeholder: 'Введите логин',
      validator: ValidateLogin,
      required: true,
    },
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

  const buttons = {
    submitButton: {
      id: 'form__button__submit',
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
