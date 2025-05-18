export function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU').replace(/\./g, '/');
}
