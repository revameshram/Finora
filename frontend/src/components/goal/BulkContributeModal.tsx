import React, { useState, useEffect } from 'react';
import { X, Layers, Percent, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0E1B15] text-[#F3F6F3] border border-[#2D4A3E] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#1E382B] bg-[#12241C]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1B6B44]/20 border border-[#1B6B44]/40 text-[#1B6B44]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F3F6F3]">Bulk Goal Contribution</h2>
              <p className="text-xs text-[#8DA698]">Distribute single lump sum or monthly paycheck across active goals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8DA698] hover:text-[#F3F6F3] hover:bg-[#1E382B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#12241C] border border-[#2D4A3E] rounded-lg">
            <button
              type="button"
              onClick={() => setMode('PER_GOAL')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'PER_GOAL' ? 'bg-[#B88728] text-[#0E1B15] shadow-md' : 'text-[#8DA698] hover:text-[#F3F6F3]'
              }`}
            >
              Mode 1: Per Goal
            </button>
            <button
              type="button"
              onClick={() => setMode('SPLIT_PCT')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'SPLIT_PCT' ? 'bg-[#B88728] text-[#0E1B15] shadow-md' : 'text-[#8DA698] hover:text-[#F3F6F3]'
              }`}
            >
              Mode 2: Split %
            </button>
            <button
              type="button"
              onClick={() => setMode('SPLIT_FIXED')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'SPLIT_FIXED' ? 'bg-[#B88728] text-[#0E1B15] shadow-md' : 'text-[#8DA698] hover:text-[#F3F6F3]'
              }`}
            >
              Mode 3: Split Fixed
            </button>
          </div>

          {/* Total Amount Input for Mode 2 & Mode 3 */}
          {mode !== 'PER_GOAL' && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                Total Contribution Pool (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  step="500"
                  placeholder="e.g. 50000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] font-semibold text-base focus:outline-none focus:border-[#B88728]"
                  required
                />
              </div>
            </div>
          )}

          {/* Allocation Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium uppercase tracking-wider text-[#8DA698]">
                Goal Breakdown ({goals.length} Goals)
              </label>
              {mode === 'SPLIT_PCT' && (
                <div className={`text-xs font-semibold flex items-center gap-1 ${Math.abs(totalPercentageSum - 100) < 0.5 ? 'text-[#1B6B44]' : 'text-[#A83A2E]'}`}>
                  {Math.abs(totalPercentageSum - 100) < 0.5 ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  Total: {totalPercentageSum.toFixed(1)}% / 100%
                </div>
              )}
              {mode === 'SPLIT_FIXED' && totalAmount !== '' && (
                <div className={`text-xs font-semibold flex items-center gap-1 ${Math.abs(totalAllocatedSum - Number(totalAmount)) < 1 ? 'text-[#1B6B44]' : 'text-[#A83A2E]'}`}>
                  {Math.abs(totalAllocatedSum - Number(totalAmount)) < 1 ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  Allocated: ₹{totalAllocatedSum.toLocaleString()} / ₹{Number(totalAmount).toLocaleString()}
                </div>
              )}
            </div>

            <div className="border border-[#1E382B] rounded-lg overflow-hidden divide-y divide-[#1E382B] bg-[#12241C]">
              {goals.map((g) => (
                <div key={g.id} className="p-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[#F3F6F3]">{g.name}</h4>
                    <p className="text-[11px] text-[#8DA698]">
                      Req. <Money amount={g.requiredMonthlyContribution} />/mo
                    </p>
                  </div>

                  <div className="w-36">
                    {mode === 'SPLIT_PCT' ? (
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={percentages[g.id] || 0}
                          onChange={(e) =>
                            setPercentages({
                              ...percentages,
                              [g.id]: Number(e.target.value),
                            })
                          }
                          className="w-full pr-7 pl-3 py-1.5 bg-[#0E1B15] border border-[#2D4A3E] rounded text-right text-xs text-[#F3F6F3] focus:border-[#B88728]"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#8DA698]">%</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#8DA698]">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={allocations[g.id] || 0}
                          onChange={(e) =>
                            setAllocations({
                              ...allocations,
                              [g.id]: Number(e.target.value),
                            })
                          }
                          className="w-full pl-6 pr-3 py-1.5 bg-[#0E1B15] border border-[#2D4A3E] rounded text-right text-xs text-[#F3F6F3] focus:border-[#B88728]"
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
              <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-xs text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-xs text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
              />
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
              Confirm Bulk Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
