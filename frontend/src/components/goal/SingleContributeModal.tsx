import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle, DollarSign, Calendar, FileText } from 'lucide-react';

interface SingleContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  goalName: string;
  onSave: (contribution: {
    goalId: string;
    type: 'CONTRIBUTION' | 'WITHDRAWAL';
    amount: number;
    date: string;
    note: string;
  }) => void;
}

export const SingleContributeModal: React.FC<SingleContributeModalProps> = ({
  isOpen,
  onClose,
  goalId,
  goalName,
  onSave,
}) => {
  const [type, setType] = useState<'CONTRIBUTION' | 'WITHDRAWAL'>('CONTRIBUTION');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    onSave({
      goalId,
      type,
      amount: Number(amount),
      date,
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0E1B15] text-[#F3F6F3] border border-[#2D4A3E] rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[#1E382B] bg-[#12241C]">
          <div>
            <h2 className="text-base font-semibold text-[#F3F6F3]">Contribute to Goal</h2>
            <p className="text-xs text-[#B88728] font-medium mt-0.5">{goalName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8DA698] hover:text-[#F3F6F3] hover:bg-[#1E382B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Contribution vs Withdrawal Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#12241C] border border-[#2D4A3E] rounded-lg">
            <button
              type="button"
              onClick={() => setType('CONTRIBUTION')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'CONTRIBUTION'
                  ? 'bg-[#1B6B44] text-[#F3F6F3] shadow-md'
                  : 'text-[#8DA698] hover:text-[#F3F6F3]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Contribution (+)
            </button>
            <button
              type="button"
              onClick={() => setType('WITHDRAWAL')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'WITHDRAWAL'
                  ? 'bg-[#A83A2E] text-[#F3F6F3] shadow-md'
                  : 'text-[#8DA698] hover:text-[#F3F6F3]'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              Withdrawal (-)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="100"
                placeholder="e.g. 10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728] text-base font-semibold"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly SIP transfer / Bonus allocation"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728] text-xs"
            />
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
              className={`px-5 py-2 text-sm font-medium text-[#F3F6F3] rounded-lg transition-colors shadow-md ${
                type === 'CONTRIBUTION' ? 'bg-[#1B6B44] hover:bg-[#238c59]' : 'bg-[#A83A2E] hover:bg-[#c74537]'
              }`}
            >
              {type === 'CONTRIBUTION' ? 'Add Contribution' : 'Record Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
