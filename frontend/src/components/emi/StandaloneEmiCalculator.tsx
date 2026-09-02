import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Zap 
} from 'lucide-react';
import { emiApi } from '../../services/emiApi';
import { StandaloneEmiCalculateResponse } from '../../types/emi';

export const StandaloneEmiCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [result, setResult] = useState<StandaloneEmiCalculateResponse | null>(null);

  // Prepayment Fast Simulation
  const [lumpSumPrepay] = useState<number>(500000);
  const [extraMonthlyEmi] = useState<number>(5000);

  const calculateEmi = async () => {
    try {
      const res = await emiApi.calculateStandalone({
        principalAmount: loanAmount,
        annualInterestRate: interestRate,
        tenureMonths: tenureYears * 12,
      });
      setResult(res);
    } catch (err) {
      console.error('Error calculating standalone EMI', err);
    }
  };

  useEffect(() => {
    calculateEmi();
  }, [loanAmount, interestRate, tenureYears]);

  // Fast estimates for prepayment rule of thumb
  const totalInterestVal = result?.totalInterestPayable || 0;

  // 1 Extra EMI/year rule of thumb or lump sum estimate
  const estimatedSavingsFromLumpSum = totalInterestVal > 0 && lumpSumPrepay > 0
    ? Math.min(totalInterestVal, Math.round(lumpSumPrepay * (interestRate / 100) * (tenureYears * 0.7)))
    : 0;

  const estimatedSavingsFromExtraEmi = totalInterestVal > 0 && extraMonthlyEmi > 0
    ? Math.min(totalInterestVal, Math.round(extraMonthlyEmi * 12 * (interestRate / 100) * (tenureYears * 1.1)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 pb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Standalone EMI & Prepayment Calculator</h2>
            <p className="text-xs text-stone-500">Pure mathematical reducing balance engine with live slider controls</p>
          </div>
        </div>

        {/* 2-Column Grid: Sliders on Left, Visual Breakdown on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 pt-6 border-t border-stone-100">
          {/* Left Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Slider 1: Loan Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Loan Principal Amount
                </label>
                <div className="flex items-center gap-1 font-mono font-bold text-sm text-stone-900 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200">
                  <span>₹</span>
                  <span>{loanAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <input
                type="range"
                min="100000"
                max="20000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                <span>₹1 Lakh</span>
                <span>₹50 Lakhs</span>
                <span>₹1 Crore</span>
                <span>₹2 Crores</span>
              </div>
            </div>

            {/* Slider 2: Interest Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Annual Interest Rate
                </label>
                <div className="flex items-center gap-1 font-mono font-bold text-sm text-stone-900 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200">
                  <span>{interestRate}%</span>
                </div>
              </div>
              <input
                type="range"
                min="5.0"
                max="20.0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                <span>5% (Prime)</span>
                <span>8.5% (Home Loan)</span>
                <span>12% (Personal)</span>
                <span>20% (Credit)</span>
              </div>
            </div>

            {/* Slider 3: Tenure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Loan Tenure (Years / Months)
                </label>
                <div className="flex items-center gap-1 font-mono font-bold text-sm text-stone-900 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200">
                  <span>{tenureYears} Years ({tenureYears * 12} Mos)</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                <span>1 Year</span>
                <span>5 Years</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>
          </div>

          {/* Right Metrics & Donut Visualization (5 cols) */}
          <div className="lg:col-span-5 bg-stone-50/70 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Monthly Repayment Obligation
              </span>
              <div className="text-2xl font-bold font-serif text-amber-900 mt-1">
                ₹{result ? result.monthlyEmi.toLocaleString('en-IN') : '0'}
                <span className="text-xs font-normal text-stone-500 font-sans ml-1">/ month</span>
              </div>
            </div>

            {/* Ratio Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-700">Principal: {result?.principalPercentage || 0}%</span>
                <span className="text-amber-800">Interest: {result?.interestPercentage || 0}%</span>
              </div>
              <div className="w-full h-3 bg-amber-500 rounded-full overflow-hidden flex">
                <div
                  className="bg-stone-800 h-full transition-all"
                  style={{ width: `${result?.principalPercentage || 50}%` }}
                />
              </div>
            </div>

            {/* Summary Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white border border-stone-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Interest</span>
                <span className="font-bold text-stone-900 font-mono">
                  ₹{result ? result.totalInterestPayable.toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Payment</span>
                <span className="font-bold text-stone-900 font-mono">
                  ₹{result ? result.totalPaymentPayable.toLocaleString('en-IN') : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prepayment Rule-of-Thumb Comparison Simulator */}
      <div className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-white border border-amber-200/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-900">
          <Zap className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Prepayment Interest Optimization Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strategy A: One-time Lump sum */}
          <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900">1. One-Time Lump Sum Prepayment</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                Tenor Reduction
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Investing a bonus or tax refund of ₹{lumpSumPrepay.toLocaleString('en-IN')} early in the loan:
            </p>
            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-emerald-900 font-semibold">Estimated Interest Saved:</span>
              <span className="font-bold font-mono text-emerald-800 text-sm">
                ~₹{estimatedSavingsFromLumpSum.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Strategy B: Extra ₹5k/mo */}
          <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900">2. Extra Monthly Commitment</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                Accelerated
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Adding just ₹{extraMonthlyEmi.toLocaleString('en-IN')}/mo to your standard monthly EMI:
            </p>
            <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-amber-900 font-semibold">Estimated Interest Saved:</span>
              <span className="font-bold font-mono text-amber-800 text-sm">
                ~₹{estimatedSavingsFromExtraEmi.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
