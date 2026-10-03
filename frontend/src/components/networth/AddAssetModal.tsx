import React, { useState } from 'react';
import { AssetCategory, CreateAssetRequest } from '../../types/networth';
import { X, Plus } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (req: CreateAssetRequest) => Promise<void>;
}

const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'CASH_BANK', label: 'Cash & Bank Accounts' },
  { value: 'INVESTMENTS', label: 'Manual Investments' },
  { value: 'CRYPTO', label: 'Crypto Assets' },
  { value: 'GOLD_SILVER', label: 'Gold & Precious Metals' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'VEHICLES', label: 'Vehicles & Automotive' },
  { value: 'RETIREMENT_ACCOUNTS', label: 'Retirement & Provident Funds' },
  { value: 'BUSINESS_ASSETS', label: 'Business Assets' },
  { value: 'OTHER', label: 'Other Holdings' },
];

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('CASH_BANK');
  const [value, setValue] = useState<number | ''>('');
  const [growthRatePct, setGrowthRatePct] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || value === '') return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        category,
        value: Number(value),
        growthRatePct: growthRatePct !== '' ? Number(growthRatePct) : undefined,
        notes: notes.trim() || undefined,
      });
      setName('');
      setValue('');
      setGrowthRatePct('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Failed to create asset:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1C1917]">Add Manual Asset</h3>
              <p className="text-xs text-[#78716C]">Record liquid, real estate, or physical holdings in base INR</p>
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
            <label className="block text-xs font-bold text-[#1C1917] mb-1">Asset Name</label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Fixed Deposit, Whitefield Apartment"
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
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
              >
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">Current Value (₹)</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={value}
                  onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold tabular-nums rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
                />
                <span className="absolute left-2.5 top-2 text-xs font-bold text-[#78716C]">₹</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1">
              Expected Annual Growth Rate (%) <span className="font-normal text-[#78716C]">(Optional)</span>
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 7.5"
              value={growthRatePct}
              onChange={(e) => setGrowthRatePct(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
            />
            <p className="text-[10px] text-[#78716C] mt-1">Used for individual CAGR estimates in projections.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1">Notes / Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Maturity date, account number details, 2.5% coupon"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg shadow-xs transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
