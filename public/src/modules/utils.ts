export function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU').replace(/\./g, '/');
}

export function formatDateVerbose(d: string | Date) {
  const date = new Date(d);
  return (
    date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }) +
    ' ' +
    date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );
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
