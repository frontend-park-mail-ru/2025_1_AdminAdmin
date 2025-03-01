/**
 * Обрезает переданную строку, если она длиннее, чем n символов
 * @param str {string} исходная строка
 * @param n {number} максимальная длинна строки, которая не будет обрезана
 * @returns {string}
 */
export function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str;
}

/**
 * Определеяет максимальную задержку в ожидании ответа от сервера
 * @param ms - время в милисекундах
 * @returns {AbortSignal}
 */
export function timeout(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}
