import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Calculator, 
  Database, 
  ArrowRight, 
  Search 
} from 'lucide-react';
import { LoanDto } from '../../types/emi';
import { emiApi } from '../../services/emiApi';
import { useToast } from '../shared/ToastContext';
import { AddLoanModal } from './AddLoanModal';
import { StandaloneEmiCalculator } from './StandaloneEmiCalculator';

interface LoanListProps {
  onSelectLoan: (loanId: string) => void;
}

export const LoanList: React.FC<LoanListProps> = ({ onSelectLoan }) => {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanDto[]>([]);
  const [_loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'portfolio' | 'calculator'>('portfolio');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await emiApi.getLoans();
      setLoans(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load loan portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleSeedSample = async () => {
    try {
      setLoading(true);
      await emiApi.seedSampleLoans();
      toast.success('Sample loans seeded (₹50L HDFC Home Loan & ₹8.5L Auto Loan)!');
      fetchLoans();
    } catch (err) {
      console.error(err);
      toast.error('Could not seed sample loans');
    } finally {
      setLoading(false);
    }
  };

  const totalOutstanding = loans.reduce((sum, l) => sum + (l.currentOutstanding || 0), 0);
  const totalMonthlyEmi = loans.reduce((sum, l) => sum + (l.monthlyEmi || 0), 0);
  const totalInterestPayable = loans.reduce((sum, l) => sum + (l.totalInterestPayable || 0), 0);
  const avgInterestRate = loans.length > 0
    ? (loans.reduce((sum, l) => sum + l.annualInterestRate, 0) / loans.length).toFixed(2)
    : '0.00';

  const filteredLoans = loans.filter(l =>
    l.loanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.lenderName && l.lenderName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Controls & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('portfolio')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'portfolio'
                ? 'bg-[#B88728] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            My Loan Portfolio ({loans.length})
          </button>

          <button
            onClick={() => setActiveView('calculator')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'calculator'
                ? 'bg-[#B88728] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Standalone Calculator
          </button>
        </div>

        {activeView === 'portfolio' && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleSeedSample}
              className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              Try with Sample Loans
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Loan
            </button>
          </div>
        )}
      </div>

      {activeView === 'calculator' ? (
        <StandaloneEmiCalculator />
      ) : (
        <>
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Total Debt Outstanding
              </span>
              <div className="text-xl font-bold font-serif text-stone-900 mt-0.5">
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">Principal remaining across {loans.length} loans</p>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Monthly EMI Burden
              </span>
              <div className="text-xl font-bold font-serif text-amber-900 mt-0.5">
                ₹{totalMonthlyEmi.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">Committed monthly cash burn</p>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Total Interest Payable
              </span>
              <div className="text-xl font-bold font-serif text-stone-800 mt-0.5">
                ₹{totalInterestPayable.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">Lifetime financing costs</p>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Avg Interest Rate
              </span>
              <div className="text-xl font-bold font-serif text-stone-900 mt-0.5">
                {avgInterestRate}%
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">Portfolio weighted average</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-3">
            <Search className="w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search loans by name or lender bank..."
              className="w-full text-xs bg-transparent text-stone-900 focus:outline-none"
            />
          </div>

          {/* Loans Grid */}
          {filteredLoans.length === 0 ? (
            <div className="p-16 text-center bg-white border border-stone-200 rounded-2xl">
              <CreditCard className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <h3 className="text-sm font-bold text-stone-800">No loans registered yet</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Track mortgages, auto loans, and personal debts with automatic reducing balance schedules.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={handleSeedSample}
                  className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg"
                >
                  Load Sample Loans
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  + Add First Loan
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLoans.map((loan) => {
                const paidAmt = (loan.sanctionedAmount || 0) - (loan.currentOutstanding || 0);

                return (
                  <div
                    key={loan.id}
                    onClick={() => onSelectLoan(loan.id)}
                    className="bg-white border border-stone-200 hover:border-amber-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-700 group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-300 transition-colors flex-shrink-0">
                            <CreditCard className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                              {loan.loanName}
                            </h3>
                            <span className="text-[11px] text-stone-500">
                              {loan.lenderName || loan.loanType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                          {loan.annualInterestRate}% p.a.
                        </span>
                      </div>

                      {/* Key Stats Row */}
                      <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-stone-50/80 rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Monthly EMI</span>
                          <span className="font-bold text-amber-900 font-serif text-sm">
                            ₹{loan.monthlyEmi.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Outstanding</span>
                          <span className="font-bold text-stone-900 font-serif text-sm">
                            ₹{loan.currentOutstanding.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Repayment Progress Bar */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span>Principal Paid: ₹{paidAmt.toLocaleString('en-IN')}</span>
                          <span className="font-bold text-stone-800">{loan.progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, loan.progressPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span className="text-[11px]">
                        {loan.remainingTenureMonths} months remaining
                      </span>
                      <span className="font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Amortization
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add Loan Modal */}
      <AddLoanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchLoans}
      />
    </div>
  );
};
