// Utility functions for formatting values

/**
 * Formats a price value in Brazilian Real format (R$ X,XX)
 * @param value - The numeric value to format
 * @param showCurrency - Whether to include "R$" prefix (default: false)
 * @returns Formatted price string (e.g., "1,20" or "R$ 1,20")
 */
export function formatPrice(value: number | string | null | undefined, showCurrency = false): string {
  if (value === null || value === undefined || value === '') {
    return showCurrency ? 'R$ 0,00' : '0,00';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return showCurrency ? 'R$ 0,00' : '0,00';
  }

  const formatted = numValue.toFixed(2).replace('.', ',');
  return showCurrency ? `R$ ${formatted}` : formatted;
}

/**
 * Parses a Brazilian price string back to a number
 * @param value - The price string (e.g., "1,20" or "R$ 1,20")
 * @returns The numeric value
 */
export function parsePrice(value: string): number {
  if (!value) return 0;

  // Remove "R$" and spaces, replace comma with dot
  const cleaned = value.replace(/R\$\s?/g, '').replace(',', '.').trim();
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

export default { formatPrice, parsePrice };
