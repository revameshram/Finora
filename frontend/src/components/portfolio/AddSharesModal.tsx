import React, { useState } from 'react';
import { X, Plus, Calculator } from 'lucide-react';
import { AddSharesRequest } from '../../types/portfolio';
import { Money } from '../shared';

interface AddSharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdingName: string;
  ticker: string;
  currentQuantity: number;
  currentAvgCost: number;
  currentPrice: number;
  onSubmit: (req: AddSharesRequest) => Promise<void>;
}

export const AddSharesModal: React.FC<AddSharesModalProps> = ({
  isOpen,
  onClose,
  holdingName,
  ticker,
  currentQuantity,
  currentAvgCost,
  currentPrice,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [costPerUnit, setCostPerUnit] = useState<number | ''>(currentPrice || '');
  const [useLivePrice, setUseLivePrice] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const numQty = Number(quantity) || 0;
  const numCost = useLivePrice ? currentPrice : Number(costPerUnit) || 0;
  const newTotalQty = currentQuantity + numQty;
  const currentInvested = currentQuantity * currentAvgCost;
  const newAddedInvested = numQty * numCost;
  const newWeightedAvgCost = newTotalQty > 0 ? (currentInvested + newAddedInvested) / newTotalQty : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) return;

    setLoading(true);
    try {
      await onSubmit({
        quantity: numQty,
        costPerUnit: useLivePrice ? undefined : numCost,
        useLivePriceAsPurchasePrice: useLivePrice,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E7E5E4] shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FAF2E8] border border-[#C27D38]/30 text-[#C27D38]">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">Add Shares: {ticker}</h3>
              <p className="text-[11px] text-[#78716C]">{holdingName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Position Summary */}
          <div className="p-3 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-[#78716C] block">Current Units</span>
              <span className="font-bold text-[#1C1917] tabular-nums">{currentQuantity}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#78716C] block">Current Avg Cost</span>
              <span className="font-bold text-[#1C1917] tabular-nums">
                <Money amount={currentAvgCost} />
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#78716C] block">Live Market Price</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                <Money amount={currentPrice} />
              </span>
            </div>
          </div>

          {/* New Shares Quantity */}
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1">
              Quantity of Shares to Add <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.0001"
              required
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
            />
          </div>

          {/* Use Live Price Checkbox */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1C1917]">
              <input
                type="checkbox"
                checked={useLivePrice}
                onChange={(e) => setUseLivePrice(e.target.checked)}
                className="h-4 w-4 rounded border-amber-300 text-[#B45309] focus:ring-[#B45309]"
              />
              <span>Use live market price as purchase price (₹{currentPrice.toFixed(2)})</span>
            </label>

            {!useLivePrice && (
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-[#1C1917] mb-1">
                  Manual Purchase Price Per Share (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                />
              </div>
            )}
          </div>

          {/* Real-time Weighted Average Calculation Preview */}
          {numQty > 0 && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-1.5 text-[#B45309] font-bold text-[11px]">
                <Calculator className="h-3.5 w-3.5" />
                <span>Weighted-Average Recalculation Preview:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60 text-[11px]">
                <div>
                  <span className="text-[#78716C] block">New Total Units:</span>
                  <span className="font-bold text-[#1C1917] tabular-nums">{newTotalQty}</span>
                </div>
                <div>
                  <span className="text-[#78716C] block">Total Additional Cost:</span>
                  <span className="font-bold text-[#1C1917] tabular-nums">
                    <Money amount={newAddedInvested} />
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-amber-200/60 flex justify-between items-center">
                  <span className="text-[#1C1917] font-semibold">New Weighted-Average Cost:</span>
                  <span className="text-sm font-bold text-[#B45309] tabular-nums">
                    <Money amount={newWeightedAvgCost} /> / share
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || numQty <= 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {loading ? 'Adding Shares...' : 'Confirm & Recalculate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
