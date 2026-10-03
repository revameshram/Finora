import React, { useState } from 'react';
import {
  ExpenseTransaction,
  ExpenseCategory,
  TransactionStatus,
  EXPENSE_CATEGORY_LABELS,
  ExpenseDashboardMetrics,
} from '../../types/expense';
import { Money, LinkedBadge, IncludeToggle, CurrencyInput } from '../shared';
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  X,
  Target,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

interface TransactionsTabProps {
  transactions: ExpenseTransaction[];
  metrics: ExpenseDashboardMetrics | null;
  budgetMonth: string;
  onAddTransaction: (txn: Partial<ExpenseTransaction> & { budgetMonth: string; item: string; amount: number; category: ExpenseCategory }) => Promise<void>;
  onUpdateTransaction: (id: string, txn: Partial<ExpenseTransaction>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
  onToggleIncluded: (id: string) => Promise<void>;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  metrics,
  budgetMonth,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onToggleStatus,
  onToggleIncluded,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<ExpenseTransaction | null>(null);

  // Form State
  const [formItem, setFormItem] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('FOOD_GROCERIES');
  const [formAmountInr, setFormAmountInr] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<TransactionStatus>('DONE');
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI');
  const [formPaymentDate, setFormPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLinkedGoalId, setFormLinkedGoalId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingTxn(null);
    setFormItem('');
    setFormDesc('');
    setFormCategory('FOOD_GROCERIES');
    setFormAmountInr(0);
    setFormStatus('DONE');
    setFormPaymentMethod('UPI');
    setFormPaymentDate(new Date().toISOString().split('T')[0]);
    setFormLinkedGoalId('');
    setIsModalOpen(true);
  };

  const openEditModal = (txn: ExpenseTransaction) => {
    setEditingTxn(txn);
    setFormItem(txn.item);
    setFormDesc(txn.description || '');
    setFormCategory(txn.category);
    setFormAmountInr(txn.amount);
    setFormStatus(txn.status);
    setFormPaymentMethod(txn.paymentMethod || 'UPI');
    setFormPaymentDate(txn.paymentDate || new Date().toISOString().split('T')[0]);
    setFormLinkedGoalId(txn.linkedGoalId || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.trim() || formAmountInr <= 0) return;

    setIsSubmitting(true);
    try {
      if (editingTxn) {
        await onUpdateTransaction(editingTxn.id, {
          item: formItem.trim(),
          description: formDesc.trim(),
          category: formCategory,
          amount: formAmountInr,
          status: formStatus,
          paymentMethod: formPaymentMethod,
          paymentDate: formPaymentDate,
          linkedGoalId: formLinkedGoalId.trim() || undefined,
        });
      } else {
        await onAddTransaction({
          budgetMonth,
          item: formItem.trim(),
          description: formDesc.trim(),
          category: formCategory,
          amount: formAmountInr,
          status: formStatus,
          paymentMethod: formPaymentMethod,
          paymentDate: formPaymentDate,
          linkedGoalId: formLinkedGoalId.trim() || undefined,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchItem = t.item.toLowerCase().includes(q);
      const matchDesc = t.description && t.description.toLowerCase().includes(q);
      if (!matchItem && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3.5 bg-white border border-[#E7E5E4] rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <ArrowDownLeft className="h-3.5 w-3.5 text-[#B45309]" />
              <span>Total Inflow</span>
            </div>
            <div className="text-lg font-bold text-[#1C1917] mt-1">
              <Money amount={metrics.totalInflow} />
            </div>
            <span className="text-[10px] text-[#78716C] block">
              {metrics.totalIncomeSourcesCount} income sources
            </span>
          </div>

          <div className="p-3.5 bg-white border border-[#E7E5E4] rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#BE123C]" />
              <span>Total Outflow</span>
            </div>
            <div className="text-lg font-bold text-[#BE123C] mt-1">
              <Money amount={metrics.totalOutflow} />
            </div>
            <span className="text-[10px] text-[#78716C] block">Committed spend</span>
          </div>

          <div className="p-3.5 bg-white border border-[#E7E5E4] rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <Clock className="h-3.5 w-3.5 text-[#B45309]" />
              <span>Pending Outflow</span>
            </div>
            <div className="text-lg font-bold text-[#B45309] mt-1">
              <Money amount={metrics.pendingOutflow} />
            </div>
            <span className="text-[10px] text-[#78716C] block">
              {metrics.pendingTransactionsCount} pending items
            </span>
          </div>

          <div className="p-3.5 bg-white border border-[#E7E5E4] rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <CheckCircle className="h-3.5 w-3.5 text-[#1C1917]" />
              <span>Net Position</span>
            </div>
            <div className="text-lg font-bold text-[#1C1917] mt-1">
              <Money amount={metrics.netPosition} />
            </div>
            <span className="text-[10px] text-[#78716C] block">Settled liquidity</span>
          </div>

          <div className="p-3.5 bg-white border border-[#E7E5E4] rounded-lg col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <TrendingDown className="h-3.5 w-3.5 text-[#1C1917]" />
              <span>Cash Flow</span>
            </div>
            <div className="text-lg font-bold text-[#1C1917] mt-1">
              <Money amount={metrics.cashFlow} />
            </div>
            <span className="text-[10px] text-[#78716C] block">Inflow − Total Outflow</span>
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#E7E5E4]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="inline-flex rounded-md border border-[#E7E5E4] p-0.5 bg-[#FAFAF9]">
            {(['ALL', 'DONE', 'PENDING'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                  statusFilter === s
                    ? 'bg-[#B88728] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {s === 'ALL' ? 'All Status' : s === 'DONE' ? 'Settled (Done)' : 'Pending'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B88728]"
          >
            <option value="ALL">All Categories</option>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#78716C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-1 focus:ring-[#B88728]"
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#B88728] hover:bg-[#a67520] text-white transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-[#E7E5E4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#78716C]">
            <thead className="bg-[#FAFAF9] text-[#1C1917] font-bold border-b border-[#E7E5E4]">
              <tr>
                <th className="px-4 py-2.5">Rollup</th>
                <th className="px-4 py-2.5">Item & Description</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Origin / Link</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-[#78716C]">
                    No transactions recorded for this filter. Click &ldquo;Add Expense&rdquo; above.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className={`hover:bg-[#FAFAF9]/60 transition-colors ${
                      !txn.isIncluded ? 'opacity-40 bg-[#FAFAF9]/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <IncludeToggle
                        isIncluded={txn.isIncluded}
                        onToggle={() => onToggleIncluded(txn.id)}
                        size="sm"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-[#1C1917]">{txn.item}</div>
                      {txn.description && (
                        <div className="text-[11px] text-[#78716C] truncate max-w-xs">{txn.description}</div>
                      )}
                      {txn.paymentMethod && (
                        <span className="text-[10px] text-[#78716C] bg-[#FAFAF9] px-1.5 py-0.2 rounded border border-[#E7E5E4]">
                          {txn.paymentMethod} {txn.paymentDate ? `· ${txn.paymentDate}` : ''}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold text-[#1C1917] bg-[#FAFAF9] px-2 py-0.5 rounded border border-[#E7E5E4]">
                        {EXPENSE_CATEGORY_LABELS[txn.category] || txn.category}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(txn.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
                          txn.status === 'DONE'
                            ? 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30 hover:bg-[#FDE68A]'
                            : 'bg-[#FAFAF9] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917]'
                        }`}
                        title="Click to toggle Done/Pending"
                      >
                        {txn.status === 'DONE' ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-[#B45309]" />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 text-[#78716C]" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <LinkedBadge
                          sourceModule={txn.sourceModule}
                          isLinked={txn.isLinked}
                          sourceEntityId={txn.sourceEntityId}
                        />
                        {txn.linkedGoalId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#334155] bg-[#F1F5F9] px-1.5 py-0.5 rounded border border-[#334155]/20">
                            <Target className="h-2.5 w-2.5" />
                            <span>Goal: {txn.linkedGoalId}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-[#1C1917] tabular-nums">
                      <Money amount={txn.amount} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(txn)}
                          className="p-1 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAFAF9]"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(txn.id)}
                          className="p-1 rounded text-[#78716C] hover:text-[#BE123C] hover:bg-[#FFE4E6]"
                          title="Delete"
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
      </div>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E7E5E4] shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
              <h3 className="text-sm font-bold text-[#1C1917]">
                {editingTxn ? 'Edit Expense Transaction' : 'Add Expense Transaction'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1917]">Item Name *</label>
                <input
                  type="text"
                  value={formItem}
                  onChange={(e) => setFormItem(e.target.value)}
                  placeholder="e.g. Whole Foods Groceries, Electric Bill"
                  required
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1917]">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                >
                  {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount with Live Multi-Currency Conversion to Base INR */}
              <CurrencyInput
                label="Amount (Saved to DB as INR) *"
                valueInBase={formAmountInr}
                onChangeInBase={setFormAmountInr}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1917]">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TransactionStatus)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                  >
                    <option value="DONE">Settled (Done)</option>
                    <option value="PENDING">Pending (Scheduled)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1917]">Payment Method</label>
                  <input
                    type="text"
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    placeholder="UPI, Credit Card, Cash"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1917]">Payment Date</label>
                  <input
                    type="date"
                    value={formPaymentDate}
                    onChange={(e) => setFormPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1917]">Goal Tag ID (Optional)</label>
                  <input
                    type="text"
                    value={formLinkedGoalId}
                    onChange={(e) => setFormLinkedGoalId(e.target.value)}
                    placeholder="e.g. goal_fire_01"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1917]">Description (Optional)</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Notes or details..."
                  rows={2}
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
                  disabled={isSubmitting || formAmountInr <= 0 || !formItem.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#B88728] hover:bg-[#a67520] text-white disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingTxn ? 'Update Transaction' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;
