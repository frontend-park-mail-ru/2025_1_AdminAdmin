import { ValidateLogin, ValidatePassword } from 'doordashers-validation';

export default {
  inputs: {
    login: {
      id: 'form__line__login__input',
      label: 'Логин',
      name: 'username',
      type: 'text',
      placeholder: 'Введите логин',
      validator: ValidateLogin,
      autocomplete: 'username',
      required: true,
    },
    password: {
      id: 'form__line__password__input',
      label: 'Пароль',
      name: 'password',
      type: 'password',
      placeholder: 'Введите пароль',
      validator: ValidatePassword,
      autocomplete: 'current-password',
      required: true,
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
