import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

interface MoneyProps {
  amount: number; // Stored amount in Base Currency (INR)
  className?: string;
  showCode?: boolean;
  showTooltip?: boolean;
}

export const Money: React.FC<MoneyProps> = ({
  amount,
  className = '',
  showCode = false,
  showTooltip = true,
}) => {
  const { displayCurrency, baseCurrency, formatDisplay, formatBase } = useCurrency();

  const isConverted = displayCurrency !== baseCurrency;
  const formattedDisplay = formatDisplay(amount, showCode);
  const formattedBase = formatBase(amount, true);

  return (
    <span
      className={`inline-flex items-baseline font-medium tabular-nums ${className}`}
      title={isConverted && showTooltip ? `Stored in DB as: ${formattedBase}` : undefined}
    >
      {formattedDisplay}
    </span>
  );
};

export default Money;
