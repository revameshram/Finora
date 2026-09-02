import { CurrencyCode, CurrencyMetadata } from '../types';

export const FALLBACK_CURRENCIES: CurrencyMetadata[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India', flag: '🇮🇳', decimalPlaces: 2 },
  { code: 'USD', name: 'United States Dollar', symbol: '$', country: 'United States', flag: '🇺🇸', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union', flag: '🇪🇺', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom', flag: '🇬🇧', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan', flag: '🇯🇵', decimalPlaces: 0 },
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ', country: 'United Arab Emirates', flag: '🇦🇪', decimalPlaces: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore', flag: '🇸🇬', decimalPlaces: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada', flag: '🇨🇦', decimalPlaces: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia', flag: '🇦🇺', decimalPlaces: 2 },
];

export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  INR: 1.0,
  USD: 0.011983,
  EUR: 0.010989,
  GBP: 0.009434,
  JPY: 1.7301,
  AED: 0.04401,
  SGD: 0.015748,
  CAD: 0.016393,
  AUD: 0.017857,
};

/**
 * Format INR using the Indian numbering system (Lakhs & Crores)
 * e.g. 150000 -> ₹1,50,000.00
 */
export function formatIndianCurrency(amount: number, showSymbol = true): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(2);
  const [wholePart, decimalPart] = fixed.split('.');

  let formatted = '';
  if (wholePart.length <= 3) {
    formatted = wholePart;
  } else {
    const lastThree = wholePart.substring(wholePart.length - 3);
    const remaining = wholePart.substring(0, wholePart.length - 3);
    let remFormatted = '';
    for (let i = 0; i < remaining.length; i++) {
      if (i > 0 && (remaining.length - i) % 2 === 0) {
        remFormatted += ',';
      }
      remFormatted += remaining[i];
    }
    formatted = `${remFormatted},${lastThree}`;
  }

  const sign = isNegative ? '-' : '';
  const symbolStr = showSymbol ? '₹' : '';
  return `${sign}${symbolStr}${formatted}.${decimalPart}`;
}

/**
 * Formats standard international currencies
 */
export function formatInternationalCurrency(
  amount: number,
  currency: CurrencyMetadata,
  showSymbol = true
): string {
  const decimals = currency.decimalPlaces;
  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return showSymbol ? `${currency.symbol}${formattedNum}` : formattedNum;
}

/**
 * Universal money formatter that automatically respects Indian or International formatting
 */
export function formatMoney(
  amount: number,
  currencyCode: CurrencyCode = 'INR',
  currencies: CurrencyMetadata[] = FALLBACK_CURRENCIES,
  options: { showSymbol?: boolean; showCode?: boolean } = { showSymbol: true, showCode: false }
): string {
  const meta =
    currencies.find((c) => c.code === currencyCode) ||
    FALLBACK_CURRENCIES.find((c) => c.code === currencyCode) ||
    FALLBACK_CURRENCIES[0];

  let formatted = '';
  if (currencyCode === 'INR') {
    formatted = formatIndianCurrency(amount, options.showSymbol ?? true);
  } else {
    formatted = formatInternationalCurrency(amount, meta, options.showSymbol ?? true);
  }

  if (options.showCode) {
    return `${formatted} ${currencyCode}`;
  }
  return formatted;
}
