import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  CheckCircle2, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';
import { LoanDto, EmiExpenseMatchDto } from '../../types/emi';
import { emiApi } from '../../services/emiApi';
import { useToast } from '../shared/ToastContext';

interface ExpenseReconciliationTabProps {
  loan: LoanDto;
  onRefresh: () => void;
}

export const ExpenseReconciliationTab: React.FC<ExpenseReconciliationTabProps> = ({
  loan,
  onRefresh: _onRefresh,
}) => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<EmiExpenseMatchDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await emiApi.getExpenseMatches(loan.id);
      setMatches(data);
    } catch (err) {
      console.error(err);
      toast.error('Could not scan Expense Tracker transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [loan.id]);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-5 bg-white border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Expense Tracker Cash-Flow Reconciliation</h3>
            <p className="text-xs text-stone-500">
              Directly queries your internal Expense Tracker ledger for recurring EMI bank debits
            </p>
          </div>
        </div>

        <button
          onClick={fetchMatches}
          disabled={loading}
          className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1.5 self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Re-scan Transactions
        </button>
      </div>

      {/* Matching Transactions Ledger */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Discovered Bank Debit Matches
            </h4>
            <span className="text-[11px] text-stone-500">
              Matches based on monthly amount (₹{loan.monthlyEmi.toLocaleString('en-IN')}) and loan keywords
            </span>
          </div>
          <span className="text-xs font-bold text-stone-500">{matches.length} Matches</span>
        </div>

        {matches.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <Receipt className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <h4 className="text-sm font-bold text-stone-800">No matching debits found</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              When you log recurring transactions with description "EMI" or "{loan.loanName}" in Expense Tracker, they will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {matches.map((m) => (
              <div
                key={m.transactionId}
                className="p-4 bg-stone-50/80 border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{m.description}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                        Auto-Matched
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {m.transactionDate}
                      </span>
                      <span>Method: {m.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-mono font-bold text-sm text-stone-900">
                    ₹{m.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="px-2.5 py-1 bg-stone-100 text-stone-700 text-[11px] font-semibold rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Reconciled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
