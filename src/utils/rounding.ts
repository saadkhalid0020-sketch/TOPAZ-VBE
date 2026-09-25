/**
 * Precision rounding and formatting utilities for financial and production data
 */

export function roundTo(val: number, decimals: number = 2): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

export function roundCurrency(val: number): number {
  return roundTo(val, 2);
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '$0.00';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(absAmount);
  return isNegative ? `(${formatted})` : formatted;
}

export function formatCurrencyDecimals(amount: number): string {
  if (isNaN(amount)) return '$0.00';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(absAmount);
  return isNegative ? `(${formatted})` : formatted;
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(val));
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}
