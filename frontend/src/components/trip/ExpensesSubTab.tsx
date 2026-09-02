import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  IndianRupee, 
  Users, 
  Calculator, 
  Edit2, 
  Trash2, 
  X, 
  CreditCard
} from 'lucide-react';
import { 
  TripDto, 
  TripExpenseDto, 
  TripParticipantDto, 
  TripCategory, 
  SplitType, 
  CreateExpenseRequest, 
  UpdateExpenseRequest,
  SmartSplitRequest 
} from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';

interface ExpensesSubTabProps {
  trip: TripDto;
  expenses: TripExpenseDto[];
  participants: TripParticipantDto[];
  onRefresh: () => void;
}

export const ExpensesSubTab: React.FC<ExpensesSubTabProps> = ({
  trip,
  expenses,
  participants,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<TripExpenseDto | null>(null);

  // 4-Tab Add Expense Modal Active Tab (§16.2)
  const [modalTab, setModalTab] = useState<'basic' | 'splits' | 'pay' | 'notes'>('basic');

  // Basic Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TripCategory>('MISCELLANEOUS');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [payerId, setPayerId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Splits State
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [splitValues, setSplitValues] = useState<{ [participantId: string]: number }>({});
  const [selectedSplitParticipants, setSelectedSplitParticipants] = useState<string[]>([]);

  // Smart Split Calculator Modal State
  const [isSmartCalcOpen, setIsSmartCalcOpen] = useState(false);
  const [calcSplitType, setCalcSplitType] = useState<SplitType>('SHARES');
  const [calcWeights, setCalcWeights] = useState<{ [pId: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flatten all participants including dependents
  const allTravelers = participants.flatMap(p => [p, ...(p.dependents || [])]);

  const openAddModal = () => {
    setEditingExpense(null);
    setModalTab('basic');
    setDescription('');
    setCategory('MISCELLANEOUS');
    setAmount('');
    setCurrency('INR');
    setPayerId(participants.length > 0 ? participants[0].id : '');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setPaymentStatus('PAID');
    setExpenseNotes('');
    setSplitType('EQUAL');

    const defaultIds = participants.map(p => p.id);
    setSelectedSplitParticipants(defaultIds);
    const initialSplits: { [pId: string]: number } = {};
    defaultIds.forEach(id => { initialSplits[id] = 1; });
    setSplitValues(initialSplits);

    setIsModalOpen(true);
  };

  const openEditModal = (e: TripExpenseDto) => {
    setEditingExpense(e);
    setModalTab('basic');
    setDescription(e.description);
    setCategory(e.category);
    setAmount(e.amount ? e.amount.toString() : '');
    setCurrency(e.originalCurrency || 'INR');
    setPayerId(e.payerId || '');
    setExpenseDate(e.expenseDate);
    setPaymentStatus(e.paymentStatus || 'PAID');
    setExpenseNotes(e.notes || '');

    if (e.splits && e.splits.length > 0) {
      setSplitType(e.splits[0].splitType);
      const splitMap: { [pId: string]: number } = {};
      const splitIds: string[] = [];
      e.splits.forEach(s => {
        splitIds.push(s.participantId);
        splitMap[s.participantId] = s.splitValue;
      });
      setSelectedSplitParticipants(splitIds);
      setSplitValues(splitMap);
    } else {
      setSplitType('EQUAL');
      const defaultIds = participants.map(p => p.id);
      setSelectedSplitParticipants(defaultIds);
      const initialSplits: { [pId: string]: number } = {};
      defaultIds.forEach(id => { initialSplits[id] = 1; });
      setSplitValues(initialSplits);
    }

    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const splitItems = selectedSplitParticipants.map(pId => ({
        participantId: pId,
        splitType: splitType,
        splitValue: splitValues[pId] !== undefined ? splitValues[pId] : 1,
      }));

      if (editingExpense) {
        const req: UpdateExpenseRequest = {
          payerId: payerId || undefined,
          description: description.trim(),
          category,
          amount: numAmount,
          originalCurrency: currency,
          originalAmount: numAmount,
          expenseDate,
          paymentStatus,
          notes: expenseNotes.trim() || undefined,
          splits: splitItems,
        };
        await tripApi.updateExpense(trip.id, editingExpense.id, req);
        toast.success('Expense updated!');
      } else {
        const req: CreateExpenseRequest = {
          payerId: payerId || undefined,
          description: description.trim(),
          category,
          amount: numAmount,
          originalCurrency: currency,
          originalAmount: numAmount,
          expenseDate,
          paymentStatus,
          notes: expenseNotes.trim() || undefined,
          splits: splitItems,
        };
        await tripApi.createExpense(trip.id, req);
        toast.success('Expense recorded & split distributed!');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expId: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await tripApi.deleteExpense(trip.id, expId);
      toast.success('Expense deleted');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete expense');
    }
  };

  // Smart Split Solver
  const handleApplySmartSplit = async () => {
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) {
      toast.warning('Please enter an expense amount first');
      return;
    }

    const participantsList = selectedSplitParticipants.map(id => ({
      participantId: id,
      value: calcWeights[id] !== undefined ? calcWeights[id] : 1,
    }));

    const req: SmartSplitRequest = {
      totalAmount: numAmount,
      splitType: calcSplitType,
      participants: participantsList,
    };

    try {
      const res = await tripApi.calculateSmartSplit(trip.id, req);
      setSplitType(calcSplitType);
      const updatedSplitValues: { [pId: string]: number } = {};
      res.splits.forEach(s => {
        updatedSplitValues[s.participantId] = s.shareValue;
      });
      setSplitValues(updatedSplitValues);
      toast.success(`Smart Split calculated across ${res.splits.length} travelers!`);
      setIsSmartCalcOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to calculate split');
    }
  };

  const toggleSplitParticipant = (pId: string) => {
    setSelectedSplitParticipants(prev =>
      prev.includes(pId) ? prev.filter(x => x !== pId) : [...prev, pId]
    );
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.payerName && e.payerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFilteredSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Controls & Category Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses by item or payer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="TRANSPORTATION">Transportation</option>
            <option value="ACCOMMODATION">Accommodation</option>
            <option value="FOOD_DINING">Food & Dining</option>
            <option value="ACTIVITIES_ENTERTAINMENT">Activities</option>
            <option value="SHOPPING">Shopping</option>
            <option value="MISCELLANEOUS">Miscellaneous</option>
            <option value="TOUR_OPERATOR">Tour Operator</option>
          </select>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right text-xs">
            <span className="text-stone-400 font-semibold uppercase block text-[10px]">Filter Total</span>
            <span className="font-bold text-stone-900">₹{totalFilteredSpent.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Expenses Ledger Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <CreditCard className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <h3 className="text-sm font-bold text-stone-800">No expenses logged yet</h3>
            <p className="text-xs text-stone-500 mt-1">Log shared meals, hotel invoices, tickets, and transfers</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
            >
              + Log First Expense
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600 uppercase">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid By</th>
                <th className="py-3 px-4">Split Breakdown</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                    {exp.expenseDate}
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-900">
                    <div>{exp.description}</div>
                    {exp.notes && <div className="text-[10px] text-stone-400 font-normal italic">{exp.notes}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 text-stone-700 rounded uppercase">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-800 font-medium">
                    {exp.payerName || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-stone-600">
                    {exp.splits && exp.splits.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-stone-400" />
                        {exp.splits.length} travelers ({exp.splits[0].splitType.toLowerCase()})
                      </span>
                    ) : (
                      <span className="text-stone-400">100% Payer</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 4-Tab Add / Edit Expense Modal (§16.2) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">
                {editingExpense ? 'Edit Expense' : 'Add Trip Expense'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
              </button>
            </div>

            {/* 4 Navigation Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50/70 px-6">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                  modalTab === 'basic'
                    ? 'border-amber-600 text-amber-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                1. Basic Info
              </button>
              <button
                type="button"
                onClick={() => setModalTab('splits')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                  modalTab === 'splits'
                    ? 'border-amber-600 text-amber-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                2. Splits ({selectedSplitParticipants.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('pay')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                  modalTab === 'pay'
                    ? 'border-amber-600 text-amber-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                3. Payment
              </button>
              <button
                type="button"
                onClick={() => setModalTab('notes')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                  modalTab === 'notes'
                    ? 'border-amber-600 text-amber-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                4. Notes
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Tab 1: Basic */}
              {modalTab === 'basic' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-semibold text-stone-700 uppercase mb-1">
                      Description <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Grand Hotel Saigon 3-Night Stay, Welcome Dinner"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 uppercase mb-1">
                        Amount <span className="text-amber-600">*</span>
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                        <input
                          type="number"
                          required
                          min="1"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="e.g. 54000"
                          className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TripCategory)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                      >
                        <option value="TRANSPORTATION">Transportation</option>
                        <option value="ACCOMMODATION">Accommodation</option>
                        <option value="FOOD_DINING">Food & Dining</option>
                        <option value="ACTIVITIES_ENTERTAINMENT">Activities & Entertainment</option>
                        <option value="SHOPPING">Shopping</option>
                        <option value="TOUR_OPERATOR">Tour Operator</option>
                        <option value="MISCELLANEOUS">Miscellaneous</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 uppercase mb-1">Paid By</label>
                      <select
                        value={payerId}
                        onChange={(e) => setPayerId(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                      >
                        <option value="">-- Select Payer --</option>
                        {allTravelers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Splits */}
              {modalTab === 'splits' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                    <div>
                      <span className="font-bold text-stone-900 block">Smart Split Engine</span>
                      <span className="text-[11px] text-stone-500">
                        Mode: {splitType === 'EQUAL' ? 'Split Equally' : splitType === 'PERCENTAGE' ? 'By Percentage' : 'By Shares / Ratios'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSmartCalcOpen(true)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 rounded-lg flex items-center gap-1.5"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Smart Split Calculator
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 uppercase mb-2">
                      Included In This Expense Split
                    </label>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {allTravelers.map((p) => {
                        const isIncluded = selectedSplitParticipants.includes(p.id);
                        const numAmount = Number(amount) || 0;
                        const shareAmt = isIncluded && selectedSplitParticipants.length > 0 
                          ? (numAmount / selectedSplitParticipants.length).toFixed(2)
                          : '0.00';

                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                              isIncluded ? 'bg-white border-amber-300' : 'bg-stone-50 border-stone-200 opacity-60'
                            }`}
                          >
                            <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isIncluded}
                                onChange={() => toggleSplitParticipant(p.id)}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span className="font-semibold text-stone-900">{p.name}</span>
                              <span className="text-[10px] text-stone-400">({p.category})</span>
                            </label>

                            {isIncluded && (
                              <span className="font-mono text-stone-800 font-bold">
                                ₹{shareAmt}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Pay */}
              {modalTab === 'pay' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-semibold text-stone-700 uppercase mb-1">
                      Payment Settlement Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                    >
                      <option value="PAID">Fully Paid by Payer</option>
                      <option value="PARTIAL">Partially Settled</option>
                      <option value="UNPAID">Pending Reimbursement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 uppercase mb-1">
                      Original Ingress Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                    >
                      <option value="INR">INR (₹) - Indian Rupee (Base)</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="VND">VND (₫) - Vietnamese Dong</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 4: Notes */}
              {modalTab === 'notes' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-semibold text-stone-700 uppercase mb-1">
                      Expense Notes / Bill Reference
                    </label>
                    <textarea
                      rows={4}
                      value={expenseNotes}
                      onChange={(e) => setExpenseNotes(e.target.value)}
                      placeholder="Attach receipt numbers, booking reference IDs, VAT invoice details..."
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <span className="font-bold text-stone-900">
                  Total: ₹{amount ? Number(amount).toLocaleString('en-IN') : '0.00'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim() || !amount}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Expense'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Split Calculator Modal (§16.2) */}
      {isSmartCalcOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">Smart Split Calculator</h3>
              </div>
              <button onClick={() => setIsSmartCalcOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Split Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcSplitType('SHARES')}
                    className={`p-2 rounded-lg font-bold border text-center ${
                      calcSplitType === 'SHARES'
                        ? 'bg-amber-100 border-amber-400 text-amber-900'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    By Shares (Ratio e.g. 2:1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcSplitType('PERCENTAGE')}
                    className={`p-2 rounded-lg font-bold border text-center ${
                      calcSplitType === 'PERCENTAGE'
                        ? 'bg-amber-100 border-amber-400 text-amber-900'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    By Percentage (%)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">
                  Adjust Weightages ({calcSplitType === 'SHARES' ? 'Shares Count' : 'Percentage %'})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedSplitParticipants.map((pId) => {
                    const p = allTravelers.find(x => x.id === pId);
                    return (
                      <div key={pId} className="flex items-center justify-between gap-2 p-2 bg-stone-50 rounded-lg">
                        <span className="font-semibold text-stone-800 truncate">{p?.name || pId}</span>
                        <input
                          type="number"
                          min="0"
                          step={calcSplitType === 'PERCENTAGE' ? '1' : '0.5'}
                          value={calcWeights[pId] !== undefined ? calcWeights[pId] : (calcSplitType === 'SHARES' ? 1 : 100 / selectedSplitParticipants.length)}
                          onChange={(e) => setCalcWeights({ ...calcWeights, [pId]: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 bg-white border border-stone-200 rounded text-right font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSmartCalcOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplySmartSplit}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                Apply Split
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
