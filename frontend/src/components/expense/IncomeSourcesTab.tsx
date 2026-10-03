import React, { useState } from 'react';
import { IncomeSource } from '../../types/expense';
import { Money, CurrencyInput } from '../shared';
import { Plus, Trash2, Edit2, X, Wallet } from 'lucide-react';

interface IncomeSourcesTabProps {
  incomes: IncomeSource[];
  budgetMonth: string;
  onAddIncome: (data: { budgetMonth: string; name: string; amount: number; instrument?: string }) => Promise<void>;
  onUpdateIncome: (id: string, data: { name: string; amount: number; instrument?: string }) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
}

export const IncomeSourcesTab: React.FC<IncomeSourcesTabProps> = ({
  incomes,
  budgetMonth,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);
  const [formName, setFormName] = useState('');
  const [formAmountInr, setFormAmountInr] = useState<number>(0);
  const [formInstrument, setFormInstrument] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalInflow = incomes.reduce((sum, i) => sum + i.amount, 0);

  const openAddModal = () => {
    setEditingIncome(null);
    setFormName('');
    setFormAmountInr(0);
    setFormInstrument('');
    setIsModalOpen(true);
  };

  const openEditModal = (income: IncomeSource) => {
    setEditingIncome(income);
    setFormName(income.name);
    setFormAmountInr(income.amount);
    setFormInstrument(income.instrument || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formAmountInr <= 0) return;

    setIsSubmitting(true);
    try {
      if (editingIncome) {
        await onUpdateIncome(editingIncome.id, {
          name: formName.trim(),
          amount: formAmountInr,
          instrument: formInstrument.trim() || undefined,
        });
      } else {
        await onAddIncome({
          budgetMonth,
          name: formName.trim(),
          amount: formAmountInr,
          instrument: formInstrument.trim() || undefined,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-lg border border-[#E7E5E4]">
        <div>
          <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider block">
            Monthly Inflow Ledger
          </span>
          <h3 className="text-sm font-bold text-[#1C1917] mt-0.5">
            Income Streams for {budgetMonth}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right bg-[#FBF8F3] px-3 py-1 rounded-md border border-[#E7E5E4]">
            <span className="text-[10px] text-[#78716C] block">Total Inflow:</span>
            <span className="text-sm font-bold text-[#1C1917]">
              <Money amount={totalInflow} />
            </span>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#B88728] hover:bg-[#a67520] text-white transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E7E5E4] overflow-hidden">
        <table className="w-full text-left text-xs text-[#78716C]">
          <thead className="bg-[#FAFAF9] text-[#1C1917] font-bold border-b border-[#E7E5E4]">
            <tr>
              <th className="px-4 py-2.5">Income Source Name</th>
              <th className="px-4 py-2.5">Payment Instrument</th>
              <th className="px-4 py-2.5 text-right">Amount (Base INR)</th>
              <th className="px-4 py-2.5 text-right">Display Value</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E5E4]">
            {incomes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-[#78716C]">
                  No income sources added for {budgetMonth}. Click &ldquo;Add Income&rdquo; above.
                </td>
              </tr>
            ) : (
              incomes.map((income) => (
                <tr key={income.id} className="hover:bg-[#FAFAF9]/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#1C1917]">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#FEF3C7] text-[#B45309]">
                        <Wallet className="h-3.5 w-3.5" />
                      </div>
                      <span>{income.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-[#78716C] bg-[#FAFAF9] px-2 py-0.5 rounded border border-[#E7E5E4]">
                      {income.instrument || 'Direct Deposit'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1C1917] tabular-nums">
                    ₹{income.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#1C1917]">
                    <Money amount={income.amount} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(income)}
                        className="p-1 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAFAF9]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteIncome(income.id)}
                        className="p-1 rounded text-[#78716C] hover:text-[#BE123C] hover:bg-[#FFE4E6]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E7E5E4] shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
              <h3 className="text-sm font-bold text-[#1C1917]">
                {editingIncome ? 'Edit Income Source' : 'Add Income Source'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1917]">Source Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Primary Salary, Consulting Retainer, Dividends"
                  required
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>

              <CurrencyInput
                label="Amount (Stored in DB as INR) *"
                valueInBase={formAmountInr}
                onChangeInBase={setFormAmountInr}
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1917]">Payment Instrument (Optional)</label>
                <input
                  type="text"
                  value={formInstrument}
                  onChange={(e) => setFormInstrument(e.target.value)}
                  placeholder="e.g. HDFC Bank Direct Deposit, UPI, Cheque"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formAmountInr <= 0 || !formName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#B88728] hover:bg-[#a67520] text-white disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingIncome ? 'Update Income' : 'Add Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeSourcesTab;
