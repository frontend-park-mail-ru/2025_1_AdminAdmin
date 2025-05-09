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
  if (!value) {
    return ValidationResult(false, 'Логин не может быть пустым');
  }

  if (value.length < 3) {
    return ValidationResult(false, 'Логин должен быть не менее 3 символов');
  }

  if (value.length > 20) {
    return ValidationResult(false, 'Логин должен быть короче 20 символов');
  }

  const isValid = /^[a-zA-Z0-9_-]+$/.test(value);
  if (!isValid) {
    return ValidationResult(
      false,
      'Логин должен содержать только латинские символы, цифры, _ или -',
    );
  }

  return ValidationResult(true);
};

/**
 * Выполняет валидацию имени или фамилии
 */
export const ValidateName = (value: string): ValidationResultType => {
  if (/^[ЉЊЋЂЏŠĐČĆŽљњћђџšđčćž\s]+$/.test(value)) {
    return ValidationResult(false, 'АХТУНГ! Присутствует вуковица');
  }

  if (value === '') {
    return ValidationResult(false, 'Поле не может быть пустым');
  }

  if (value.length < 2) {
    return ValidationResult(false, 'Поле слишком короткое');
  }

  if (value.length >= 25) {
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

const alphaNumRegex = /^[a-zA-Zа-яА-ЯёЁ0-9]{1,20}$/;

export const ValidateFlat = (value: string): ValidationResultType => {
  if (!value) return ValidationResult(false, 'Квартира/офис не может быть пустым');
  if (!alphaNumRegex.test(value)) {
    return ValidationResult(false, 'Неверный формат квартиры/офиса');
  }
  return ValidationResult(true);
};

export const ValidateDoorPhone = (value: string): ValidationResultType => {
  if (!value) return ValidationResult(false, 'Домофон не может быть пустым');
  if (!alphaNumRegex.test(value)) {
    return ValidationResult(
      false,
      'Домофон должен содержать от 1 до 20 символов (буквы и/или цифры)',
    );
  }
  return ValidationResult(true);
};

export const ValidatePorch = (value: string): ValidationResultType => {
  if (!value) return ValidationResult(false, 'Подъезд обязателен');
  if (!alphaNumRegex.test(value)) {
    return ValidationResult(
      false,
      'Подъезд должен содержать от 1 до 20 символов (буквы и/или цифры)',
    );
  }
  return ValidationResult(true);
};

export const ValidateFloor = (value: string): ValidationResultType => {
  const num = Number(value);
  if (!value) return ValidationResult(false, 'Этаж обязателен');
  if (isNaN(num) || num < 1 || num > 100) {
    return ValidationResult(false, 'Этаж должен быть числом от 1 до 100');
  }
  return ValidationResult(true);
};

export const ValidateCourierComment = (value: string): ValidationResultType => {
  if (!value.trim()) return ValidationResult(false, 'Комментарий не может быть пустым');
  if (value.length > 300) return ValidationResult(false, 'Комментарий слишком длинный');
  return ValidationResult(true);
};
