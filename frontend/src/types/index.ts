// Global and shared cross-module TypeScript types
export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'AED'
  | 'SGD'
  | 'CAD'
  | 'AUD';

export interface CurrencyMetadata {
  code: CurrencyCode;
  name: string;
  symbol: string;
  country: string;
  flag: string;
  decimalPlaces: number;
}

export interface ExchangeRates {
  baseCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  lastUpdated: string;
  isLive: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  baseCurrency: CurrencyCode;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SourceModule =
  | 'MANUAL'
  | 'PORTFOLIO'
  | 'NET_WORTH'
  | 'EXPENSE'
  | 'GOAL'
  | 'FIRE'
  | 'TRIP'
  | 'VAULT'
  | 'EMI_MANAGER';

export interface LinkableItem {
  isIncluded: boolean;
  isLinked: boolean;
  sourceModule: SourceModule;
  sourceEntityId?: string | null;
  linkedAt?: string | null;
}
