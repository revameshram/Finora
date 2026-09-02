import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';
import { CurrencyCode, CurrencyMetadata, ExchangeRates } from '../types';
import { FALLBACK_CURRENCIES, FALLBACK_RATES, formatMoney } from '../utils/currency';

interface CurrencyContextType {
  baseCurrency: CurrencyCode;
  displayCurrency: CurrencyCode;
  displayCurrencyMeta: CurrencyMetadata;
  supportedCurrencies: CurrencyMetadata[];
  rates: Record<CurrencyCode, number>;
  isLiveRates: boolean;
  isLoading: boolean;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  convertToDisplay: (amountInBase: number) => number;
  convertToBase: (amountInForeign: number, foreignCurrency: CurrencyCode) => number;
  formatDisplay: (amountInBase: number, showCode?: boolean) => string;
  formatBase: (amountInBase: number, showCode?: boolean) => string;
  getCurrencyMeta: (code: CurrencyCode) => CurrencyMetadata;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [baseCurrency] = useState<CurrencyCode>('INR');
  const [displayCurrency, setDisplayCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('finora_display_currency') as CurrencyCode;
    return saved && FALLBACK_CURRENCIES.some((c) => c.code === saved) ? saved : 'INR';
  });

  const [supportedCurrencies, setSupportedCurrencies] = useState<CurrencyMetadata[]>(FALLBACK_CURRENCIES);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [isLiveRates, setIsLiveRates] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const [currenciesRes, ratesRes] = await Promise.allSettled([
          apiClient.get<CurrencyMetadata[]>('/currencies/supported'),
          apiClient.get<ExchangeRates>('/currencies/rates?base=INR'),
        ]);

        if (currenciesRes.status === 'fulfilled') {
          setSupportedCurrencies(currenciesRes.value.data);
        }
        if (ratesRes.status === 'fulfilled') {
          setRates(ratesRes.value.data.rates);
          setIsLiveRates(ratesRes.value.data.isLive);
        }
      } catch {
        // Fallback to static defaults
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencyData();
  }, []);

  const setDisplayCurrency = (currency: CurrencyCode) => {
    setDisplayCurrencyState(currency);
    localStorage.setItem('finora_display_currency', currency);
  };

  const getCurrencyMeta = (code: CurrencyCode): CurrencyMetadata => {
    return (
      supportedCurrencies.find((c) => c.code === code) ||
      FALLBACK_CURRENCIES.find((c) => c.code === code) ||
      FALLBACK_CURRENCIES[0]
    );
  };

  const displayCurrencyMeta = getCurrencyMeta(displayCurrency);

  // Converts DB-stored INR to current Display Currency
  const convertToDisplay = (amountInBase: number): number => {
    if (displayCurrency === baseCurrency) {
      return amountInBase;
    }
    const targetRate = rates[displayCurrency] || 1;
    const decimals = displayCurrencyMeta.decimalPlaces;
    return Number((amountInBase * targetRate).toFixed(decimals));
  };

  // Converts foreign user input to Base Currency (INR) for Database persistence
  const convertToBase = (amountInForeign: number, foreignCurrency: CurrencyCode): number => {
    if (foreignCurrency === baseCurrency) {
      return amountInForeign;
    }
    const foreignToInrRate = rates[foreignCurrency] || 1;
    // Rate in 'rates' map is 1 INR = X Foreign => 1 Foreign = 1 / X INR
    const converted = amountInForeign / foreignToInrRate;
    return Number(converted.toFixed(2));
  };

  const formatDisplay = (amountInBase: number, showCode = false): string => {
    const converted = convertToDisplay(amountInBase);
    return formatMoney(converted, displayCurrency, supportedCurrencies, {
      showSymbol: true,
      showCode,
    });
  };

  const formatBase = (amountInBase: number, showCode = false): string => {
    return formatMoney(amountInBase, baseCurrency, supportedCurrencies, {
      showSymbol: true,
      showCode,
    });
  };

  return (
    <CurrencyContext.Provider
      value={{
        baseCurrency,
        displayCurrency,
        displayCurrencyMeta,
        supportedCurrencies,
        rates,
        isLiveRates,
        isLoading,
        setDisplayCurrency,
        convertToDisplay,
        convertToBase,
        formatDisplay,
        formatBase,
        getCurrencyMeta,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
