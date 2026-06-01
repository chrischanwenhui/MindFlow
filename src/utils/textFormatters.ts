export function joinWithOxfordComma(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}
