import {
  ValidateLogin,
  ValidateName,
  ValidatePassword,
  ValidatePhone,
} from '../../modules/validation.ts';

export default {
  buttons: {
    login: {
      id: 'form__tab_login',
      text: 'Вход',
      icon: '/src/assets/user.png',
      style: 'form__button',
    },
    register: {
      id: 'form__tab_register',
      text: 'Регистрация',
      icon: '/src/assets/password.png',
      style: 'form__button',
    },
  },
  forms: {
    login: {
      id: 'login-form',
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
    },
    register: {
      id: 'register-form',
      inputs: {
        fName: {
          id: 'form__line__firstname__input',
          label: 'Имя',
          placeholder: 'Введите имя',
          validator: ValidateName,
        },
        lName: {
          id: 'form__line__lastname__input',
          label: 'Фамилия',
          placeholder: 'Введите фамилию',
          validator: ValidateName,
        },
        phone: {
          id: 'form__line__phone__input',
          label: 'Телефон',
          placeholder: 'Введите телефон',
          validator: ValidatePhone,
        },
        login: {
          id: 'form__line__register_login__input',
          label: 'Логин',
          placeholder: 'Введите логин',
          validator: ValidateLogin,
        },
        password: {
          id: 'form__line__register_password__input',
          label: 'Пароль',
          type: 'password',
          placeholder: 'Введите пароль (Не менее 10 символов)',
          validator: ValidatePassword,
        },
        repeatPassword: {
          id: 'form__line__repeat_password__input',
          label: 'Повторите пароль',
          type: 'password',
          placeholder: 'Повторите пароль',
          validator: ValidatePassword,
        },
      },
      selects: {
        code: {
          id: 'form__line__phone_code',
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
      buttons: {
        submitBtn: {
          id: 'form__line__register_button',
          text: 'Зарегистрироваться',
          style: 'form__button button_active',
        },
      },
    },
  },
};
