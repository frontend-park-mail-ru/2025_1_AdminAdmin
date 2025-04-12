import { ValidateLogin, ValidatePassword } from '@modules/validation';

export default {
  inputs: {
    login: {
      id: 'form__line__login__input',
      label: 'Логин',
      placeholder: 'Введите логин',
      validator: ValidateLogin,
    },
    password: {
      id: 'form__line__password__input',
      label: 'Пароль',
      type: 'password',
      placeholder: 'Введите пароль',
      validator: ValidatePassword,
    },
  },
  buttons: {
    submitBtn: {
      id: 'form__line__login_button',
      text: 'Войти',
      type: 'submit',
      style: 'form__button button_active',
    },
  },
};
