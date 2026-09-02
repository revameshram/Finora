import React from 'react';

interface IncludeToggleProps {
  isIncluded: boolean;
  onToggle: (newIncluded: boolean) => void;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const IncludeToggle: React.FC<IncludeToggleProps> = ({
  isIncluded,
  onToggle,
  label,
  className = '',
  size = 'sm',
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isIncluded}
        onClick={() => onToggle(!isIncluded)}
        className={`relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1F1A16] focus:ring-offset-1 ${
          isIncluded ? 'bg-[#1F1A16]' : 'bg-[#E6E2DA]'
        } ${size === 'sm' ? 'h-4 w-7' : 'h-5 w-9'}`}
      >
        <span
          className={`pointer-events-none inline-block transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            isIncluded ? (size === 'sm' ? 'translate-x-3' : 'translate-x-4') : 'translate-x-0'
          } ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`}
        />
      </button>

      {label && (
        <span
          onClick={() => onToggle(!isIncluded)}
          className={`cursor-pointer text-xs select-none ${
            isIncluded ? 'font-semibold text-[#1F1A16]' : 'font-normal text-[#6B635B]/60 line-through'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default IncludeToggle;
