import React, { useState } from 'react';
import { X, Settings, AlertCircle, Percent, DollarSign } from 'lucide-react';
import { Money } from '../shared';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlySavingsCapacity: number;
  behindScheduleThresholdPct: number;
  defaultInflationRatePct: number;
  onSave: (settings: {
    monthlySavingsCapacity: number;
    behindScheduleThresholdPct: number;
    defaultInflationRatePct: number;
  }) => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  monthlySavingsCapacity,
  behindScheduleThresholdPct,
  defaultInflationRatePct,
  onSave,
}) => {
  const [capacity, setCapacity] = useState(monthlySavingsCapacity);
  const [threshold, setThreshold] = useState(behindScheduleThresholdPct);
  const [inflation, setInflation] = useState(defaultInflationRatePct);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      monthlySavingsCapacity: capacity,
      behindScheduleThresholdPct: threshold,
      defaultInflationRatePct: inflation,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0E1B15] text-[#F3F6F3] border border-[#2D4A3E] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#1E382B] bg-[#12241C]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#B88728]/10 border border-[#B88728]/30 text-[#B88728]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F3F6F3]">Goal Manager Settings</h2>
              <p className="text-xs text-[#8DA698]">Configure capacity ceilings & pace thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8DA698] hover:text-[#F3F6F3] hover:bg-[#1E382B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
              Monthly Savings Capacity (₹/mo)
            </label>
            <p className="text-xs text-[#6B8576] mb-3">
              The maximum total monthly savings you can allocate across all active goals. Used to flag over-capacity warnings.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
              Behind-Schedule Lag Threshold (%)
            </label>
            <p className="text-xs text-[#6B8576] mb-3">
              How far off linear pace a goal must lag before triggering a "Behind" warning banner (Default: 10%).
            </p>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full pr-8 pl-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
              Default Inflation Rate (%)
            </label>
            <p className="text-xs text-[#6B8576] mb-3">
              Applied automatically to compute inflation-adjusted future target values for newly created goals (Default: 6.0%).
            </p>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="25"
                step="0.1"
                value={inflation}
                onChange={(e) => setInflation(Number(e.target.value))}
                className="w-full pr-8 pl-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">%</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E382B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#8DA698] hover:text-[#F3F6F3] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-[#0E1B15] bg-[#B88728] hover:bg-[#d49d32] rounded-lg transition-colors shadow-md"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
