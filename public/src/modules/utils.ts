export function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU').replace(/\./g, '/');
}

export function formatNumber(num: number) {
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}
