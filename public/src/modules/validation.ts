/**
 * Тип результата валидации
 */
interface ValidationResultType {
  result: boolean;
  message: string | null;
}

/**
 * Результат валидации
 */
const ValidationResult = (result: boolean, message: string | null = null): ValidationResultType => {
  return { result, message };
};

/**
 * Выполняет валидацию пароля
 * @param value переданная строка
 * @returns Вернет true - если пароль подходит, в противном случае false, а также сообщение об ошибке
 */
export const ValidatePassword = (value: string): ValidationResultType => {
  if (value === '') {
    return ValidationResult(false, 'Пароль не может быть пустым');
  }

  if (value.length < 8 || value.length > 25) {
    return ValidationResult(false, 'Пароль должен быть от 8 до 25 символов');
  }

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

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

  return ValidationResult(true);
};

/**
 * Выполняет валидацию логина
 */
export const ValidateLogin = (value: string): ValidationResultType => {
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
    const charCode = value.charCodeAt(index);
    if (
      !(
        (charCode >= 97 && charCode <= 122) || // a-z
        (charCode >= 65 && charCode <= 90) || // A-Z
        (charCode >= 48 && charCode <= 57) || // 0-9
        charCode === 95 || // _
        charCode === 45 // -
      )
    ) {
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
 */
export const ValidateName = (value: string): ValidationResultType => {
  if (value === '') {
    return ValidationResult(false, 'Поле не может быть пустым');
  }

  if (value.length < 2) {
    return ValidationResult(false, 'Поле слишком короткое');
  }

  if (value.length > 30) {
    return ValidationResult(false, 'Поле слишком длинное');
  }

  if (!/^[а-яА-ЯёЁ]+$/.test(value)) {
    return ValidationResult(false, 'Есть не кириллица');
  }

  return ValidationResult(true);
};

/**
 * Выполняет валидацию номера телефона
 */
export const ValidatePhone = (value: string): ValidationResultType => {
  if (value === '') {
    return ValidationResult(false, 'Телефон не может быть пустым');
  }

  const cleanedValue = value.replace(/[\s()-]/g, '');
  if (!/^\d+$/.test(cleanedValue)) {
    return ValidationResult(false, 'Должен содержать только цифры');
  }

  if (cleanedValue.length < 9 || cleanedValue.length > 10) {
    return ValidationResult(false, 'От 9 до 10 цифр без учета префикса');
  }

  return ValidationResult(true);
};
