import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { CurrencyCode } from '../../types';
import { formatMoney } from '../../utils/currency';

interface CurrencyInputProps {
  label?: string;
  valueInBase: number; // Controlled base currency value in INR
  onChangeInBase: (amountInInr: number) => void;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label = 'Amount',
  valueInBase,
  onChangeInBase,
  className = '',
}) => {
  const { supportedCurrencies, convertToBase, getCurrencyMeta } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
  const [inputVal, setInputVal] = useState<string>(() => (valueInBase ? String(valueInBase) : ''));

  const handleCurrencyChange = (newCode: CurrencyCode) => {
    setSelectedCurrency(newCode);
    const parsed = parseFloat(inputVal) || 0;
    const inr = convertToBase(parsed, newCode);
    onChangeInBase(inr);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputVal(raw);
    const parsed = parseFloat(raw) || 0;
    const inr = convertToBase(parsed, selectedCurrency);
    onChangeInBase(inr);
  };

  const currentMeta = getCurrencyMeta(selectedCurrency);
  const inrEquivalent = selectedCurrency !== 'INR' ? convertToBase(parseFloat(inputVal) || 0, selectedCurrency) : null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-bold text-[#1F1A16]">{label}</label>}

      <div className="flex rounded-md border border-[#E6E2DA] bg-white focus-within:border-[#1F1A16] focus-within:ring-1 focus-within:ring-[#1F1A16] transition-all">
        {/* Currency Dropdown */}
        <select
          value={selectedCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
          className="px-2.5 py-2 text-xs font-bold text-[#1F1A16] bg-[#F8F7F4] border-r border-[#E6E2DA] rounded-l-md focus:outline-none cursor-pointer"
        >
          {supportedCurrencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} ({c.symbol})
            </option>
          ))}
        </select>

        {/* Input */}
        <div className="relative flex-1 flex items-center">
          <span className="pl-3 text-xs font-semibold text-[#6B635B] select-none">
            {currentMeta.symbol}
          </span>
          <input
            type="number"
            step="any"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full pl-1.5 pr-3 py-2 text-xs font-semibold text-[#1F1A16] placeholder-[#6B635B]/40 focus:outline-none rounded-r-md tabular-nums"
          />
        </div>
      </div>

      {/* Real-Time Database INR Conversion Preview */}
      {inrEquivalent !== null && (
        <div className="flex items-center justify-between text-[11px] text-[#6B635B] bg-[#F8F7F4] px-2.5 py-1 rounded border border-[#E6E2DA]">
          <span>Database value (INR):</span>
          <span className="font-bold text-[#1F1A16] tabular-nums">
            {formatMoney(inrEquivalent, 'INR')}
          </span>
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;
