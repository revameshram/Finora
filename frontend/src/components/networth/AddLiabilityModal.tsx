import React, { useState } from 'react';
import { LiabilityCategory, CreateLiabilityRequest } from '../../types/networth';
import { X, ShieldAlert } from 'lucide-react';

interface AddLiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (req: CreateLiabilityRequest) => Promise<void>;
}

const LIABILITY_CATEGORIES: { value: LiabilityCategory; label: string }[] = [
  { value: 'HOME_LOAN', label: 'Home Loan / Mortgage' },
  { value: 'CAR_LOAN', label: 'Car / Auto Loan' },
  { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
  { value: 'CREDIT_CARD', label: 'Credit Card Outstanding' },
  { value: 'STUDENT_LOAN', label: 'Student / Education Loan' },
  { value: 'BUSINESS_LOAN', label: 'Business Debt' },
  { value: 'OTHER_DEBT', label: 'Other Debt' },
];

export const AddLiabilityModal: React.FC<AddLiabilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LiabilityCategory>('HOME_LOAN');
  const [amount, setAmount] = useState<number | ''>('');
  const [interestRatePct, setInterestRatePct] = useState<number | ''>('');
  const [recurringPayment, setRecurringPayment] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount === '') return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        category,
        amount: Number(amount),
        interestRatePct: interestRatePct !== '' ? Number(interestRatePct) : undefined,
        recurringPayment: recurringPayment !== '' ? Number(recurringPayment) : undefined,
        notes: notes.trim() || undefined,
        sourceModule: 'MANUAL',
        isLinked: false,
      });
      setName('');
      setAmount('');
      setInterestRatePct('');
      setRecurringPayment('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Failed to create liability:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1C1917]">Add Liability Record</h3>
              <p className="text-xs text-[#78716C]">Record loans, mortgages, or card obligations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1">Liability Name</label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Home Loan, Regalia Credit Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LiabilityCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
              >
                {LIABILITY_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">Outstanding Balance (₹)</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold tabular-nums rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
                />
                <span className="absolute left-2.5 top-2 text-xs font-bold text-[#78716C]">₹</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 8.5"
                value={interestRatePct}
                onChange={(e) => setInterestRatePct(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">Monthly EMI / Payment (₹)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 45000"
                value={recurringPayment}
                onChange={(e) => setRecurringPayment(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold tabular-nums rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1">Notes / Terms</label>
            <textarea
              rows={2}
              placeholder="e.g. 20-year fixed rate, loan account details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] rounded-lg border border-[#E7E5E4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-[#BE123C] hover:bg-[#9F1239] rounded-lg shadow-xs transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Add Liability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
