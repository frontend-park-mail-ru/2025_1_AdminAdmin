/**
 * Выполняет валидацию пароля
 * @param value {string} переданная строка
 * @returns {{result: boolean, message: (string|null)}} вернет true - если пароль подходит, в противном случае false, а также сообщение об ошибке
 */
export const ValidatePassword = (value) => {
  // Проверка на пустой пароль
  if (value === '') {
    return ValidationResult(false, 'Пароль не может быть пустым');
  }

  // Проверка длины пароля
  if (value.length < 8 || value.length > 25) {
    return ValidationResult(false, 'Пароль должен быть от 8 до 25 символов');
  }

  // Регулярные выражения для проверки условий
  const hasUpperCase = /[A-Z]/.test(value); // хотя бы 1 заглавная буква
  const hasLowerCase = /[a-z]/.test(value); // хотя бы 1 строчная буква
  const hasDigit = /\d/.test(value); // хотя бы 1 цифра
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value); // хотя бы 1 спец. символ

  if (!hasUpperCase) {
    return ValidationResult(false, 'Пароль должен содержать хотя бы одну заглавную букву');
  }

  if (!hasLowerCase) {
    return ValidationResult(false, 'Пароль должен содержать хотя бы одну строчную букву');
  }

  if (!hasDigit) {
    return ValidationResult(false, 'Пароль должен содержать хотя бы одну цифру');
  }

  if (!hasSpecialChar) {
    return ValidationResult(false, 'Пароль должен содержать хотя бы один специальный символ');
  }

  // Если все проверки пройдены
  return ValidationResult(true);
};

/**
 * Выполняет валидацию логина
 * @param value {string} переданная строка
 * @returns {{result: boolean, message: string | null}} вернет true - если логин подходит, в противном случае false, а также сообщение об ошибке
 */
export const ValidateLogin = (value) => {
  if (value === '') {
    return ValidationResult(false, 'Логин не может быть пустым');
  }

  if (value.length < 3) {
    return ValidationResult(false, 'Логин должен быть не менее 3 символов');
  }

  if (value.length > 20) {
    return ValidationResult(false, 'Логин должен быть короче 20 символов');
  }

  for (let index = 0; index < value.length; ++index) {
    if (
      !(
        (value.charCodeAt(index) >= 97 && value.charCodeAt(index) <= 122) || // a-z
        (value.charCodeAt(index) >= 65 && value.charCodeAt(index) <= 90) || // A-Z
        (value.charCodeAt(index) >= 48 && value.charCodeAt(index) <= 57) || // 0-9
        value.charCodeAt(index) === 95 || // _
        value.charCodeAt(index) === 45
      )
    ) {
      // -
      return ValidationResult(
        false,
        'Логин должен содержать только латинские символы, цифры, _ или -',
      );
    }
  }

  return ValidationResult(true);
};

/**
 * Выполняет валидацию имени или фамилии
 * @param value {string} переданная строка
 * @returns {{result: boolean, message: string | null}} вернет true, если строка подходит, в противном случае false, а также сообщение об ошибке
 */
export const ValidateName = (value) => {
  if (value === '') {
    return ValidationResult(false, 'Поле не может быть пустым');
  }

  if (value.length < 2) {
    return ValidationResult(false, 'Поле слишком короткое');
  }

  if (value.length > 30) {
    return ValidationResult(false, 'Поле слишком длинное');
  }

  const isCyrillic = /^[а-яА-ЯёЁ]+$/.test(value);

  if (!isCyrillic) {
    return ValidationResult(false, 'Присутствуют не кириллические буквы');
  }

  return ValidationResult(true);
};

/**
 * Выполняет валидацию номера телефона
 * @param value {string} переданная строка
 * @returns {{result: boolean, message: string | null}} вернет true, если номер телефона подходит, иначе false и сообщение об ошибке
 */
export const ValidatePhone = (value) => {
  if (value === '') {
    return ValidationResult(false, 'Номер телефона не может быть пустым');
  }

  if (!/^\d+$/.test(value)) {
    return ValidationResult(false, 'Номер телефона должен содержать только цифры');
  }

  if (value.length < 10 || value.length > 15) {
    return ValidationResult(false, 'Телефон от 10 до 15 символов');
  }

  return ValidationResult(true);
};

/**
 * Результат валидации
 * @param result {boolean} результат проверки
 * @param message {string | null} сообщение об ошибке
 * @returns {{result: boolean, message: string | null}}
 */
const ValidationResult = (result, message = null) => {
  return { result, message };
};
