import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { CurrencyCode } from '../../types';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface CurrencySelectorProps {
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
}) => {
  const { displayCurrency, displayCurrencyMeta, supportedCurrencies, setDisplayCurrency, isLiveRates } =
    useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: CurrencyCode) => {
    setDisplayCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-[#E6E2DA] text-[#1F1A16] hover:border-[#6B635B] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1F1A16] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{displayCurrencyMeta.flag}</span>
        <span className="font-bold text-[#1F1A16]">{displayCurrencyMeta.code}</span>
        <span className="text-[#6B635B] text-xs">({displayCurrencyMeta.symbol})</span>
        <ChevronDown className="h-3.5 w-3.5 text-[#6B635B] ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 rounded-lg bg-white shadow-lg border border-[#E6E2DA] z-50 py-1 divide-y divide-[#E6E2DA]/60">
          <div className="px-3 py-2 bg-[#F8F7F4] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F1A16]">
              <Globe className="h-3.5 w-3.5 text-[#6B635B]" />
              <span>Display Currency</span>
            </div>
            {isLiveRates && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8E561C] bg-[#FAF2E8] px-1.5 py-0.5 rounded">
                Live Rates
              </span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {supportedCurrencies.map((currency) => {
              const isSelected = currency.code === displayCurrency;
              return (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleSelect(currency.code)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F8F7F4] transition-colors ${
                    isSelected ? 'bg-[#FAF2E8] text-[#1F1A16] font-semibold' : 'text-[#6B635B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{currency.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#1F1A16]">{currency.code}</span>
                        <span className="text-xs text-[#6B635B]">({currency.symbol})</span>
                        <span className="text-[11px] text-[#6B635B]/80">{currency.name}</span>
                      </div>
                      <p className="text-[10px] text-[#6B635B]/70">{currency.country}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#C27D38]" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-2 text-[10px] text-[#6B635B] bg-[#F8F7F4]">
            Database storage is strictly in <span className="font-semibold text-[#1F1A16]">INR (₹)</span>.
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
