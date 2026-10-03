import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  ArrowRight, 
  X 
} from 'lucide-react';
import { 
  LoanDto, 
  LoanPrepaymentDto, 
  PrepaymentImpact, 
  PrepaymentType, 
  PrepaymentSimulationResultDto, 
  AddPrepaymentRequest 
} from '../../types/emi';
import { emiApi } from '../../services/emiApi';
import { useToast } from '../shared/ToastContext';

interface PrepaymentSimulatorTabProps {
  loan: LoanDto;
  onRefresh: () => void;
}

export const PrepaymentSimulatorTab: React.FC<PrepaymentSimulatorTabProps> = ({
  loan,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [prepayments, setPrepayments] = useState<LoanPrepaymentDto[]>([]);
  const [_loading, setLoading] = useState(true);

  // Simulation Sandbox State
  const [simAmount, setSimAmount] = useState<number>(500000);
  const [simImpact, setSimImpact] = useState<PrepaymentImpact>('REDUCE_TENURE');
  const [simType, setSimType] = useState<PrepaymentType>('ONE_TIME');
  const [simResult, setSimResult] = useState<PrepaymentSimulationResultDto | null>(null);
  const [_isSimulating, setIsSimulating] = useState(false);
  const [investReturnRate, setInvestReturnRate] = useState<number>(12);

  // Prepay vs Invest Arbitrage Calculations
  const remainingYears = Math.max(1, (loan.remainingTenureMonths || loan.tenureMonths || 120) / 12);
  const calculateInvestGain = () => {
    const r = investReturnRate / 100;
    if (simType === 'ONE_TIME') {
      const fv = simAmount * Math.pow(1 + r, remainingYears);
      return Math.round(fv - simAmount);
    } else if (simType === 'RECURRING_ANNUAL') {
      const n = Math.floor(remainingYears);
      let totalFv = 0;
      for (let i = 1; i <= n; i++) {
        totalFv += simAmount * Math.pow(1 + r, n - i + 1);
      }
      return Math.round(totalFv - (simAmount * n));
    } else {
      // Monthly SIP
      const monthlyRate = r / 12;
      const totalMonths = Math.round(remainingYears * 12);
      const fv = simAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
      return Math.round(fv - (simAmount * totalMonths));
    }
  };

  const investmentGain = calculateInvestGain();
  const interestSaved = simResult?.totalInterestSaved || 0;
  const arbitrageDifference = investmentGain - interestSaved;

  // Add Actual Prepayment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAmount, setPayAmount] = useState('100000');
  const [payImpact, setPayImpact] = useState<PrepaymentImpact>('REDUCE_TENURE');
  const [payType, setPayType] = useState<PrepaymentType>('ONE_TIME');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrepayments = async () => {
    try {
      setLoading(true);
      const data = await emiApi.getPrepayments(loan.id);
      setPrepayments(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load prepayments');
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    try {
      setIsSimulating(true);
      const res = await emiApi.simulatePrepayment(loan.id, {
        amount: simAmount,
        impact: simImpact,
        prepaymentType: simType,
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    fetchPrepayments();
  }, [loan.id]);

  useEffect(() => {
    runSimulation();
  }, [simAmount, simImpact, simType, loan.id]);

  const handleAddPrepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    setIsSubmitting(true);
    try {
      const req: AddPrepaymentRequest = {
        paymentDate: payDate,
        amount: Number(payAmount),
        impact: payImpact,
        prepaymentType: payType,
        notes: payNotes.trim() || undefined,
      };
      await emiApi.addPrepayment(loan.id, req);
      toast.success('Prepayment recorded & schedule updated!');
      setIsModalOpen(false);
      fetchPrepayments();
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not record prepayment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrepayment = async (prepayId: string) => {
    if (!confirm('Delete this prepayment and restore previous amortization schedule?')) return;

    try {
      await emiApi.deletePrepayment(loan.id, prepayId);
      toast.success('Prepayment removed');
      fetchPrepayments();
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete prepayment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Sandbox Panel */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Interactive Prepayment Scenario Sandbox</h3>
              <p className="text-xs text-stone-500">
                Simulate early payoff savings before committing real money
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center gap-1.5 self-end sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Real Prepayment
          </button>
        </div>

        {/* Sandbox Controls & Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Prepayment Amount
                </label>
                <div className="font-mono font-bold text-sm text-stone-900 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200">
                  ₹{simAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <input
                type="range"
                min="25000"
                max={Math.max(100000, loan.sanctionedAmount)}
                step="25000"
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Strategy Impact
                </label>
                <select
                  value={simImpact}
                  onChange={(e) => setSimImpact(e.target.value as PrepaymentImpact)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-semibold focus:outline-none"
                >
                  <option value="REDUCE_TENURE">Reduce Tenor (Max Savings)</option>
                  <option value="REDUCE_EMI">Reduce Monthly EMI (Cash Flow)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Frequency
                </label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value as PrepaymentType)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-semibold focus:outline-none"
                >
                  <option value="ONE_TIME">One-Time Lump Sum</option>
                  <option value="RECURRING_ANNUAL">Annual Bonus (Yearly)</option>
                  <option value="RECURRING_MONTHLY">Extra Monthly SIP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sandbox Comparison Results (6 cols) */}
          <div className="lg:col-span-6 bg-stone-50/80 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Strategy Outcome
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                {simResult?.interestSavingsPercent || 0}% Interest Saved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-stone-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Interest Saved</span>
                <span className="text-lg font-bold font-serif text-emerald-700 block mt-0.5">
                  ₹{simResult ? simResult.totalInterestSaved.toLocaleString('en-IN') : '0'}
                </span>
              </div>

              <div className="p-3 bg-white border border-stone-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Tenure Shaved Off</span>
                <span className="text-lg font-bold font-serif text-stone-900 block mt-0.5">
                  {simResult ? `${simResult.monthsSaved} Months` : '0'}
                </span>
              </div>
            </div>

            {/* Payoff Date Comparison */}
            <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-stone-400 block">Baseline Payoff</span>
                <span className="font-bold text-stone-500 line-through">
                  {simResult?.baselinePayoffDate}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-emerald-800 block">Accelerated Payoff</span>
                <span className="font-bold text-emerald-800">
                  {simResult?.simulatedPayoffDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prepay vs Invest Arbitrage Analyzer */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Prepay vs. Invest Comparison
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                  Arbitrage Strategy
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Compare guaranteed interest avoided by prepaying vs. compounding wealth if invested in equities/mutual funds
              </p>
            </div>

            {/* Expected ROI Selector */}
            <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-semibold text-stone-600">Assumed Equity Return:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="range"
                  min="6"
                  max="16"
                  step="0.5"
                  value={investReturnRate}
                  onChange={(e) => setInvestReturnRate(Number(e.target.value))}
                  className="w-20 accent-amber-600 h-1.5 bg-stone-200 rounded cursor-pointer"
                />
                <span className="font-mono font-bold text-xs text-stone-900 w-10 text-right">
                  {investReturnRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option A: Prepay */}
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Option A: Prepay Loan</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  Guaranteed {loan.annualInterestRate}%
                </span>
              </div>
              <div className="text-xl font-bold font-serif text-emerald-700">
                ₹{interestSaved.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">
                Direct interest avoided. Risk-free, tax-free effective return of {loan.annualInterestRate}% per annum.
              </p>
            </div>

            {/* Option B: Invest */}
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Option B: Invest in Market</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  Compounding @ {investReturnRate}%
                </span>
              </div>
              <div className="text-xl font-bold font-serif text-blue-700">
                ₹{investmentGain.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">
                Estimated wealth created over ~{remainingYears.toFixed(1)} years at {investReturnRate}% CAGR market growth.
              </p>
            </div>

            {/* Strategy Insight / Arbitrage Verdict */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              arbitrageDifference > 0 
                ? 'bg-blue-50/70 border-blue-200' 
                : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                  Strategy Verdict
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-stone-900 shadow-2xs">
                  {arbitrageDifference > 0 ? 'Investing Outperforms' : 'Prepayment Outperforms'}
                </span>
              </div>
              <div className={`text-xl font-bold font-serif ${
                arbitrageDifference > 0 ? 'text-blue-800' : 'text-emerald-800'
              }`}>
                {arbitrageDifference > 0 ? '+' : ''}₹{Math.abs(arbitrageDifference).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-stone-600 leading-snug">
                {arbitrageDifference > 0 
                  ? `Investing generates ₹${arbitrageDifference.toLocaleString('en-IN')} more wealth than prepaying, assuming ${investReturnRate}% returns.`
                  : `Prepaying saves ₹${Math.abs(arbitrageDifference).toLocaleString('en-IN')} more, locking in a guaranteed risk-free return.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recorded Prepayments Ledger */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Recorded Prepayments Ledger</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Permanently applied lump sums and recurring prepayments on this loan
            </p>
          </div>
          <span className="text-xs font-bold text-stone-500">
            {prepayments.length} Records
          </span>
        </div>

        {prepayments.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            No real prepayments recorded yet. Click "Record Real Prepayment" above to log a bonus or tax refund.
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {prepayments.map((p) => (
              <div
                key={p.id}
                className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    ₹
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">₹{p.amount.toLocaleString('en-IN')}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-200 text-stone-700 rounded">
                        {p.impact}
                      </span>
                    </div>
                    {p.notes && <p className="text-[11px] text-stone-500 mt-0.5">{p.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-stone-400 text-[11px] font-mono">{p.paymentDate}</span>
                  <button
                    onClick={() => handleDeletePrepayment(p.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-200/60 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Prepayment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">Record Prepayment</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleAddPrepayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">
                  Prepayment Amount (₹) <span className="text-amber-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">
                  Payment Date <span className="text-amber-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Strategy Impact</label>
                  <select
                    value={payImpact}
                    onChange={(e) => setPayImpact(e.target.value as PrepaymentImpact)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="REDUCE_TENURE">Reduce Tenor</option>
                    <option value="REDUCE_EMI">Reduce EMI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Frequency</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as PrepaymentType)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="ONE_TIME">One-Time</option>
                    <option value="RECURRING_ANNUAL">Annual Bonus</option>
                    <option value="RECURRING_MONTHLY">Extra Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Diwal bonus prepayment"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !payAmount}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Apply Prepayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
