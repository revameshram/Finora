import React, { useState } from 'react';
import { X, Copy, Calendar } from 'lucide-react';

interface CopyMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  availableMonths: string[];
  onCopy: (fromMonth: string, copyIncome: boolean, copyTxns: boolean, copyTasks: boolean) => Promise<void>;
}

export const CopyMonthModal: React.FC<CopyMonthModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  availableMonths,
  onCopy,
}) => {
  const previousMonths = availableMonths.filter((m) => m !== currentMonth);
  const [fromMonth, setFromMonth] = useState<string>(previousMonths[0] || '');
  const [copyIncome, setCopyIncome] = useState(true);
  const [copyTxns, setCopyTxns] = useState(true);
  const [copyTasks, setCopyTasks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromMonth) return;

    setIsSubmitting(true);
    try {
      await onCopy(fromMonth, copyIncome, copyTxns, copyTasks);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full border border-[#E7E5E4] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#B45309]">
              <Copy className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">Copy Budget Month</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] p-1 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1C1917]">
              Source Month to Copy From
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#78716C]" />
              <select
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                required
              >
                {previousMonths.length === 0 ? (
                  <option value="">No previous months available</option>
                ) : (
                  previousMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                )}
              </select>
            </div>
            <p className="text-[11px] text-[#78716C]">
              Copying template into active month: <span className="font-bold text-[#1C1917]">{currentMonth}</span>
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E7E5E4]">
            <span className="block text-xs font-bold text-[#1C1917]">Items to Replicate:</span>

            <label className="flex items-center gap-2 text-xs text-[#1C1917] cursor-pointer">
              <input
                type="checkbox"
                checked={copyIncome}
                onChange={(e) => setCopyIncome(e.target.checked)}
                className="rounded text-[#1C1917] focus:ring-[#1C1917]"
              />
              <span>Income Sources (Salaries, Dividends, Retainers)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#1C1917] cursor-pointer">
              <input
                type="checkbox"
                checked={copyTxns}
                onChange={(e) => setCopyTxns(e.target.checked)}
                className="rounded text-[#1C1917] focus:ring-[#1C1917]"
              />
              <span>Recurring Transactions (Copied as Pending status)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#1C1917] cursor-pointer">
              <input
                type="checkbox"
                checked={copyTasks}
                onChange={(e) => setCopyTasks(e.target.checked)}
                className="rounded text-[#1C1917] focus:ring-[#1C1917]"
              />
              <span>Monthly Checklist Tasks (Copied as TODO)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fromMonth}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#1C1917] hover:bg-[#342D27] text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmitting ? 'Copying...' : 'Duplicate Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CopyMonthModal;
