import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Receipt, 
  HelpCircle,
  X,
  CreditCard 
} from 'lucide-react';
import { LoanDto, AmortizationScheduleDto, UpdateLoanRequest } from '../../types/emi';
import { emiApi } from '../../services/emiApi';
import { useToast } from '../shared/ToastContext';
import { OnboardingDrawer } from '../shared/OnboardingDrawer';
import { AmortizationTab } from './AmortizationTab';
import { PrepaymentSimulatorTab } from './PrepaymentSimulatorTab';
import { ExpenseReconciliationTab } from './ExpenseReconciliationTab';

interface LoanDetailProps {
  loanId: string;
  onBack: () => void;
}

export const LoanDetail: React.FC<LoanDetailProps> = ({ loanId, onBack }) => {
  const { toast } = useToast();
  const [loan, setLoan] = useState<LoanDto | null>(null);
  const [schedule, setSchedule] = useState<AmortizationScheduleDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'amortization' | 'prepayment' | 'reconciliation'>('amortization');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editLender, setEditLender] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editTenure, setEditTenure] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      const [l, s] = await Promise.all([
        emiApi.getLoan(loanId),
        emiApi.getAmortizationSchedule(loanId),
      ]);
      setLoan(l);
      setSchedule(s);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [loanId]);

  const openEditModal = () => {
    if (!loan) return;
    setEditName(loan.loanName);
    setEditLender(loan.lenderName || '');
    setEditRate(loan.annualInterestRate.toString());
    setEditTenure(loan.tenureMonths.toString());
    setEditNotes(loan.notes || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const req: UpdateLoanRequest = {
        loanName: editName.trim(),
        lenderName: editLender.trim() || undefined,
        annualInterestRate: Number(editRate),
        tenureMonths: Number(editTenure),
        notes: editNotes.trim() || undefined,
      };
      await emiApi.updateLoan(loan.id, req);
      toast.success('Loan parameters updated!');
      setIsEditModalOpen(false);
      fetchLoanData();
    } catch (err) {
      console.error(err);
      toast.error('Could not update loan');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLoan = async () => {
    if (!loan) return;
    if (!confirm(`Permanently delete "${loan.loanName}" and all associated schedules?`)) return;

    try {
      await emiApi.deleteLoan(loan.id);
      toast.success('Loan deleted');
      onBack();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete loan');
    }
  };

  if (loading || !loan) {
    return (
      <div className="p-16 text-center text-stone-400">
        <CreditCard className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-600" />
        <p className="text-xs">Loading loan workspace...</p>
      </div>
    );
  }

  const paidAmount = (loan.sanctionedAmount || 0) - (loan.currentOutstanding || 0);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loan Portfolio
        </button>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={openEditModal}
            title="Edit Loan Terms"
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteLoan}
            title="Delete Loan"
            className="p-2 text-stone-400 hover:text-rose-600 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            title="Loan Guide"
            className="p-2 text-stone-400 hover:text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-amber-900/80 text-amber-300 border-amber-700">
              {loan.loanType.replace('_', ' ')}
            </span>
            {loan.lenderName && (
              <span className="text-xs text-stone-300 font-medium">
                {loan.lenderName}
              </span>
            )}
            {loan.isLinked && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-stone-800 border border-stone-700 text-stone-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Net Worth Synced
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold font-serif">{loan.loanName}</h2>
          {loan.notes && (
            <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
              {loan.notes}
            </p>
          )}

          {/* Meta Outflow Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-stone-700/80 text-xs">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Monthly EMI</span>
              <span className="text-base font-bold font-serif text-amber-300">
                ₹{loan.monthlyEmi.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Interest Rate</span>
              <span className="text-base font-bold font-serif text-white">
                {loan.annualInterestRate}% p.a.
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Outstanding Principal</span>
              <span className="text-base font-bold font-serif text-white">
                ₹{loan.currentOutstanding.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Sanctioned Amount</span>
              <span className="text-base font-bold font-serif text-white">
                ₹{loan.sanctionedAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Repayment Progress Bar */}
          <div className="mt-4 pt-2">
            <div className="flex items-center justify-between text-[11px] text-stone-300 mb-1">
              <span>Paid: ₹{paidAmount.toLocaleString('en-IN')}</span>
              <span className="font-bold text-amber-400">{loan.progressPercent}% Cleared</span>
            </div>
            <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, loan.progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main Navigation Tabs */}
      <div className="flex border-b border-stone-200 bg-white rounded-xl px-4 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('amortization')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'amortization'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Amortization Schedule
        </button>

        <button
          onClick={() => setActiveTab('prepayment')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'prepayment'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Prepayment Simulator & Ledger
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reconciliation'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Expense Reconciliation
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'amortization' && (
        <AmortizationTab
          loan={loan}
          schedule={schedule}
        />
      )}

      {activeTab === 'prepayment' && (
        <PrepaymentSimulatorTab
          loan={loan}
          onRefresh={fetchLoanData}
        />
      )}

      {activeTab === 'reconciliation' && (
        <ExpenseReconciliationTab
          loan={loan}
          onRefresh={fetchLoanData}
        />
      )}

      {/* Edit Loan Terms Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">Edit Loan Terms</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
              </button>
            </div>

            <form onSubmit={handleUpdateLoan} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Loan Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Lender Bank</label>
                <input
                  type="text"
                  value={editLender}
                  onChange={(e) => setEditLender(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    min="1"
                    value={editTenure}
                    onChange={(e) => setEditTenure(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editName.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboarding Guide Drawer */}
      <OnboardingDrawer
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        moduleName="EMI Manager"
        subtitle="Loan Amortization & Prepayment Optimization"
        icon={CreditCard}
        steps={[
          {
            stepNumber: 1,
            title: '1. Register Loan Liabilities',
            description: 'Enter principal, interest rate, and tenure. EMI Manager automatically calculates your reducing balance schedule.',
            tip: 'Toggle Net Worth Sync to automatically link this loan into your consolidated balance sheet.',
          },
          {
            stepNumber: 2,
            title: '2. Explore Amortization Year by Year',
            description: 'Inspect exact principal vs interest splits month by month and see how early payments reduce total interest.',
            tip: 'Export your complete schedule to CSV anytime for tax or accounting purposes.',
          },
          {
            stepNumber: 3,
            title: '3. Optimize with Prepayments',
            description: 'Use the Sandbox to simulate lump sums or extra monthly ₹. Compare Tenure Reduction vs EMI Reduction.',
            tip: 'Tenure reduction saves substantially more interest than EMI reduction over the life of a loan.',
          },
          {
            stepNumber: 4,
            title: '4. Reconcile with Expense Tracker',
            description: 'Automatically match recurring bank debits logged in your Expense Tracker with your EMI obligation.',
            tip: 'Keeps your committed cash flow aligned with actual bank statements.',
          },
        ]}
        tipsChecklist={[
          { id: 'tip_prepay_early', label: 'Make prepayments early in the loan tenure to maximize interest savings' },
          { id: 'tip_sync_nw', label: 'Keep Net Worth sync enabled so outstanding balance updates your total liabilities' },
          { id: 'tip_export_tax', label: 'Export the yearly amortization table during tax season to claim interest deductions' },
        ]}
      />
    </div>
  );
};
