export function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU').replace(/\./g, '/');
}

export function formatNumber(num: number) {
  return Number.isInteger(num) ? num.toString() : num.toFixed(2).replace('.', ',');
}
/**
 * Делает первую букву строки заглавной.
 * @param error - Текст ошибки
 * @returns Строка с заглавной первой буквой
 */
export const capitalizeError = (error: string): string => {
  if (!error) return '';
  return error.charAt(0).toUpperCase() + error.slice(1);
};
