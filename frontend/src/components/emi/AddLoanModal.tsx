import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  IndianRupee, 
  Percent, 
  Clock, 
  Building2, 
  ShieldCheck
} from 'lucide-react';
import { CreateLoanRequest, LoanType } from '../../types/emi';
import { emiApi } from '../../services/emiApi';
import { useToast } from '../shared/ToastContext';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();

  const [loanName, setLoanName] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('HOME_LOAN');
  const [lenderName, setLenderName] = useState('');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [sanctionedAmount, setSanctionedAmount] = useState('');
  const [annualInterestRate, setAnnualInterestRate] = useState('8.5');
  const [tenureMonths, setTenureMonths] = useState('240');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [syncWithNetWorth, setSyncWithNetWorth] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Live preview calculations
  const p = Number(sanctionedAmount) || 0;
  const r = (Number(annualInterestRate) || 0) / (12 * 100);
  const n = Number(tenureMonths) || 0;
  const estimatedEmi = (p > 0 && r > 0 && n > 0)
    ? Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
    : 0;
  const totalPayable = estimatedEmi * n;
  const totalInterest = Math.max(0, totalPayable - p);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName.trim() || !sanctionedAmount || !annualInterestRate || !tenureMonths) return;

    setIsSubmitting(true);
    try {
      const req: CreateLoanRequest = {
        loanName: loanName.trim(),
        loanType,
        lenderName: lenderName.trim() || undefined,
        accountNumberMasked: accountNumberMasked.trim() || undefined,
        sanctionedAmount: Number(sanctionedAmount),
        annualInterestRate: Number(annualInterestRate),
        tenureMonths: Number(tenureMonths),
        startDate,
        syncWithNetWorth,
        notes: notes.trim() || undefined,
      };

      await emiApi.createLoan(req);
      toast.success('Loan registered & amortization schedule generated!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Could not create loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Add Loan Liability</h3>
              <p className="text-[11px] text-stone-500">Track repayment schedule, amortization & prepayment savings</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
          </button>
        </div>

        {/* Live Calculation Preview Banner */}
        {p > 0 && estimatedEmi > 0 && (
          <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-200/70 flex items-center justify-between text-xs">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Estimated Monthly EMI</span>
              <span className="text-base font-bold font-serif text-amber-900">
                ₹{estimatedEmi.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Total Interest</span>
              <span className="font-bold text-stone-800">
                ₹{totalInterest.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">
                Loan Name <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                value={loanName}
                onChange={(e) => setLoanName(e.target.value)}
                placeholder="e.g. HDFC Home Loan, EV Car Loan"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">
                Loan Category <span className="text-amber-600">*</span>
              </label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value as LoanType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
              >
                <option value="HOME_LOAN">Home Loan / Mortgage</option>
                <option value="CAR_LOAN">Car / Auto Loan</option>
                <option value="PERSONAL_LOAN">Personal Loan</option>
                <option value="EDUCATION_LOAN">Education Loan</option>
                <option value="GOLD_LOAN">Gold Loan</option>
                <option value="BUSINESS_LOAN">Business / Commercial</option>
                <option value="OTHER">Other Debt</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">Lender Bank</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={lenderName}
                  onChange={(e) => setLenderName(e.target.value)}
                  placeholder="e.g. SBI, HDFC, ICICI, Axis"
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">Masked Account Number</label>
              <input
                type="text"
                value={accountNumberMasked}
                onChange={(e) => setAccountNumberMasked(e.target.value)}
                placeholder="e.g. •••• •••• 9421"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">
                Loan Amount (₹) <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  required
                  min="1"
                  value={sanctionedAmount}
                  onChange={(e) => setSanctionedAmount(e.target.value)}
                  placeholder="5000000"
                  className="w-full pl-8 pr-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">
                Interest Rate (%) <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.1"
                  value={annualInterestRate}
                  onChange={(e) => setAnnualInterestRate(e.target.value)}
                  placeholder="8.5"
                  className="w-full pl-8 pr-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 uppercase mb-1">
                Tenure (Months) <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  required
                  min="1"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  placeholder="240"
                  className="w-full pl-8 pr-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase mb-1">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
            />
          </div>

          {/* Net Worth Sync Toggle (Cross-track contract) */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold text-stone-900 block text-xs">Publish to Net Worth Tracker</span>
                <span className="text-[10px] text-stone-500">
                  Automatically syncs as a liability with sourceModule = EMI_MANAGER
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={syncWithNetWorth}
              onChange={(e) => setSyncWithNetWorth(e.target.checked)}
              className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Collateral details, floating/fixed interest conditions..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !loanName.trim() || !sanctionedAmount}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Register Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
