import React, { useState, useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { Money } from '../shared';

interface GoalSummaryItem {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetAmount: number;
  requiredMonthlyContribution: number;
}

interface BulkContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: GoalSummaryItem[];
  onSave: (payload: {
    mode: 'PER_GOAL' | 'SPLIT_PCT' | 'SPLIT_FIXED';
    totalAmount?: number;
    date: string;
    note: string;
    goalAllocations?: Record<string, number>;
    goalPercentages?: Record<string, number>;
  }) => void;
}

export const BulkContributeModal: React.FC<BulkContributeModalProps> = ({
  isOpen,
  onClose,
  goals,
  onSave,
}) => {
  const [mode, setMode] = useState<'PER_GOAL' | 'SPLIT_PCT' | 'SPLIT_FIXED'>('PER_GOAL');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('Bulk monthly allocation');

  // Allocation states
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [percentages, setPercentages] = useState<Record<string, number>>({});

  useEffect(() => {
    if (goals.length > 0) {
      const initAlloc: Record<string, number> = {};
      const initPct: Record<string, number> = {};
      const equalPct = Number((100 / goals.length).toFixed(2));

      goals.forEach((g) => {
        initAlloc[g.id] = g.requiredMonthlyContribution || 0;
        initPct[g.id] = equalPct;
      });

      setAllocations(initAlloc);
      setPercentages(initPct);
    }
  }, [goals]);

  if (!isOpen) return null;

  const totalAllocatedSum = Object.values(allocations).reduce((a, b) => a + b, 0);
  const totalPercentageSum = Object.values(percentages).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'SPLIT_PCT') {
      if (!totalAmount || Number(totalAmount) <= 0) return;
      if (Math.abs(totalPercentageSum - 100) > 0.5) return;
    } else if (mode === 'SPLIT_FIXED') {
      if (!totalAmount || Number(totalAmount) <= 0) return;
      if (Math.abs(totalAllocatedSum - Number(totalAmount)) > 1) return;
    }

    onSave({
      mode,
      totalAmount: totalAmount === '' ? undefined : Number(totalAmount),
      date,
      note,
      goalAllocations: mode !== 'SPLIT_PCT' ? allocations : undefined,
      goalPercentages: mode === 'SPLIT_PCT' ? percentages : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white text-[#1C1917] border border-[#E7E5E4] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#E7E5E4] bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#1C1917]">Bulk Goal Contribution</h2>
              <p className="text-xs text-[#78716C]">Distribute single lump sum or monthly paycheck across active goals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl">
            <button
              type="button"
              onClick={() => setMode('PER_GOAL')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'PER_GOAL' ? 'bg-[#B88728] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Mode 1: Per Goal
            </button>
            <button
              type="button"
              onClick={() => setMode('SPLIT_PCT')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'SPLIT_PCT' ? 'bg-[#B88728] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Mode 2: Split %
            </button>
            <button
              type="button"
              onClick={() => setMode('SPLIT_FIXED')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'SPLIT_FIXED' ? 'bg-[#B88728] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Mode 3: Split Fixed
            </button>
          </div>

          {/* Total Amount Input for Mode 2 & Mode 3 */}
          {mode !== 'PER_GOAL' && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                Total Pool Amount to Distribute (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] text-sm font-semibold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  placeholder="e.g. 50000"
                  value={totalAmount}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setTotalAmount(val);

                    if (mode === 'SPLIT_PCT' && typeof val === 'number') {
                      const updated: Record<string, number> = {};
                      goals.forEach((g) => {
                        const pct = percentages[g.id] || 0;
                        updated[g.id] = Math.round((val * pct) / 100);
                      });
                      setAllocations(updated);
                    }
                  }}
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] font-semibold text-base focus:outline-none focus:border-[#B88728]"
                  required
                />
              </div>
            </div>
          )}

          {/* Goals Allocation Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#78716C]">
              <span className="font-semibold uppercase tracking-wider">Goal Distributions</span>
              {mode === 'PER_GOAL' && (
                <span>Total: <strong className="text-[#1C1917]"><Money amount={totalAllocatedSum} /></strong></span>
              )}
              {mode === 'SPLIT_PCT' && (
                <span className={Math.abs(totalPercentageSum - 100) > 0.5 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                  Total: {totalPercentageSum.toFixed(1)}% / 100%
                </span>
              )}
              {mode === 'SPLIT_FIXED' && typeof totalAmount === 'number' && (
                <span className={Math.abs(totalAllocatedSum - totalAmount) > 1 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                  Allocated: ₹{totalAllocatedSum.toLocaleString()} / ₹{totalAmount.toLocaleString()}
                </span>
              )}
            </div>

            <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white">
              {goals.map((g) => (
                <div key={g.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#1C1917] truncate">{g.name}</h4>
                    <span className="text-[10px] text-[#78716C] block">
                      Target: <Money amount={g.targetAmount} /> · Req. SIP: <Money amount={g.requiredMonthlyContribution} />/mo
                    </span>
                  </div>

                  {/* Input field based on mode */}
                  <div className="w-40 shrink-0">
                    {mode === 'SPLIT_PCT' ? (
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={percentages[g.id] ?? 0}
                          onChange={(e) => {
                            const newPct = Number(e.target.value);
                            const updatedPct = { ...percentages, [g.id]: newPct };
                            setPercentages(updatedPct);

                            if (typeof totalAmount === 'number') {
                              setAllocations({
                                ...allocations,
                                [g.id]: Math.round((totalAmount * newPct) / 100),
                              });
                            }
                          }}
                          className="w-full pr-7 pl-3 py-1.5 bg-white border border-[#E7E5E4] rounded-lg text-right text-xs text-[#1C1917] focus:border-[#B88728]"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] text-xs font-semibold">%</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78716C] text-xs font-semibold">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={allocations[g.id] ?? 0}
                          onChange={(e) => {
                            setAllocations({
                              ...allocations,
                              [g.id]: Number(e.target.value),
                            });
                          }}
                          className="w-full pl-6 pr-3 py-1.5 bg-white border border-[#E7E5E4] rounded-lg text-right text-xs text-[#1C1917] focus:border-[#B88728]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                Contribution Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-lg text-xs text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                Note / Memo
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-lg text-xs text-[#1C1917] focus:outline-none focus:border-[#B88728]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg transition-colors shadow-xs"
            >
              Distribute ₹{totalAllocatedSum.toLocaleString()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
