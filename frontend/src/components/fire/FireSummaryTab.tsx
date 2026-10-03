import React from 'react';
import {
  Flame,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Calendar,
  Layers,
  Receipt,
  Award,
} from 'lucide-react';
import { Money } from '../shared';

export interface FireGrowthProjectionPoint {
  year: number;
  age: number;
  nominalWealth: number;
  realPurchasingPower: number;
  targetFireNumber: number;
  isFireReached: boolean;
}

interface FireSummaryTabProps {
  fireNumber: number;
  effectiveCurrentSavings: number;
  currentProgressPercentage: number;
  yearsToFire: number | null;
  computedRetirementAge: number | null;
  requiredMonthlySavings: number | null;
  projections: FireGrowthProjectionPoint[];
  monthlySavings: number;
  expectedAnnualReturnPct: number;
  postRetirementReturnPct: number;
  expectedAnnualInflationPct: number;
  safeWithdrawalRatePct: number;
  annualExpensesInRetirement: number;
  activeMode: 'YEARS_TO_FIRE' | 'REQUIRED_SAVINGS';
  targetRetirementAge?: number | null;
  onNavigateToModule?: (moduleId: string) => void;
  onBackToInputs: () => void;
}

export const FireSummaryTab: React.FC<FireSummaryTabProps> = ({
  fireNumber,
  effectiveCurrentSavings,
  currentProgressPercentage,
  yearsToFire,
  computedRetirementAge,
  requiredMonthlySavings,
  projections,
  monthlySavings,
  expectedAnnualReturnPct,
  postRetirementReturnPct,
  expectedAnnualInflationPct,
  safeWithdrawalRatePct,
  annualExpensesInRetirement,
  activeMode,
  targetRetirementAge,
  onNavigateToModule,
  onBackToInputs,
}) => {
  const swrMultiple = safeWithdrawalRatePct > 0 ? Math.round(100 / safeWithdrawalRatePct) : 25;
  const wealthGap = Math.max(0, fireNumber - effectiveCurrentSavings);

  // Find exact FIRE milestone year
  const fireMilestonePoint = projections.find((p) => p.isFireReached);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ------------------------------------------------------------- */}
      {/* 4 SUMMARY METRIC CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Target FIRE Number */}
        <div className="p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
            <span>Target FIRE Corpus</span>
            <Flame className="h-4 w-4 text-[#C27D38]" />
          </div>
          <div className="text-xl font-serif font-bold text-[#1C1917] tabular-nums mt-1">
            <Money amount={fireNumber} />
          </div>
          <span className="text-[10px] text-[#78716C] block">
            {swrMultiple}x multiplier @ {safeWithdrawalRatePct}% SWR
          </span>
        </div>

        {/* 2. Current Wealth Base */}
        <div className="p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
            <span>Current Wealth Base</span>
            <Layers className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-xl font-serif font-bold text-[#1C1917] tabular-nums mt-1">
            <Money amount={effectiveCurrentSavings} />
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            {Number(currentProgressPercentage || 0).toFixed(1)}% of Target Funded
          </span>
        </div>

        {/* 3. Timeline / Retirement Age */}
        <div className="p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
            <span>{activeMode === 'YEARS_TO_FIRE' ? 'Timeline to FIRE' : 'Target Retirement'}</span>
            <Calendar className="h-4 w-4 text-[#B45309]" />
          </div>
          <div className="text-xl font-serif font-bold text-[#1C1917] tabular-nums mt-1">
            {activeMode === 'YEARS_TO_FIRE'
              ? yearsToFire !== null
                ? `${yearsToFire} Years`
                : '—'
              : targetRetirementAge
              ? `Age ${targetRetirementAge}`
              : '—'}
          </div>
          <span className="text-[10px] text-[#B45309] font-bold block">
            {computedRetirementAge ? `Retire at Age ${computedRetirementAge} 🎉` : 'Timeline computed via compound engine'}
          </span>
        </div>

        {/* 4. Monthly Savings Required / Rate */}
        <div className="p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716C]">
            <span>{activeMode === 'REQUIRED_SAVINGS' ? 'Required Monthly SIP' : 'Monthly Savings Rate'}</span>
            <TrendingUp className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-xl font-serif font-bold text-emerald-800 tabular-nums mt-1">
            <Money amount={activeMode === 'REQUIRED_SAVINGS' ? requiredMonthlySavings || 0 : monthlySavings} />
            <span className="text-xs text-[#78716C] font-normal">/mo</span>
          </div>
          <span className="text-[10px] text-[#78716C] block">
            Compounding @ {expectedAnnualReturnPct}% CAGR
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CORPUS ACCUMULATION PROGRESS BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="p-6 bg-white border border-[#E7E5E4] rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#FAF2E8] border border-[#C27D38]/30 text-[#C27D38]">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">FIRE Corpus Accumulation Progress</h3>
              <p className="text-[11px] text-[#78716C]">
                Tracking present wealth against your {swrMultiple}x annual expense benchmark (<Money amount={annualExpensesInRetirement} />/yr).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#FAF2E8] text-[#C27D38] border border-[#C27D38]/30">
              {Number(currentProgressPercentage || 0).toFixed(1)}% Achieved
            </span>
          </div>
        </div>

        {/* Multi-tier Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden flex border border-[#E7E5E4]">
            <div
              className="h-full bg-gradient-to-r from-[#1B6B44] via-[#C27D38] to-[#1B6B44] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(1, currentProgressPercentage))}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-[#78716C] pt-1 font-semibold">
            <span>Current: <strong className="text-[#1C1917]"><Money amount={effectiveCurrentSavings} /></strong></span>
            <span>Wealth Gap Remaining: <strong className="text-[#C27D38]"><Money amount={wealthGap} /></strong></span>
            <span>Target: <strong className="text-emerald-800"><Money amount={fireNumber} /></strong></span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 30-YEAR WEALTH PROJECTION TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="p-6 bg-white border border-[#E7E5E4] rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E5E4]">
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">Savings Growth & Inflation Projections (30-Year Trajectory)</h3>
            <p className="text-[11px] text-[#78716C]">
              Comparing <strong>Nominal Wealth</strong> vs <strong>Real Purchasing Power</strong> (discounted @ {expectedAnnualInflationPct}% inflation) against target.
            </p>
          </div>

          {fireMilestonePoint && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              <Award className="h-4 w-4 text-emerald-700" />
              <span>Projected FIRE Target: Year {fireMilestonePoint.year} (Age {fireMilestonePoint.age})</span>
            </div>
          )}
        </div>

        <div className="border border-[#E7E5E4] rounded-xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#FAFAF9] border-b border-[#E7E5E4] text-[10px] font-semibold text-[#78716C] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Horizon</th>
                  <th className="py-2.5 px-4">Age</th>
                  <th className="py-2.5 px-4 text-right">Nominal Projected Wealth</th>
                  <th className="py-2.5 px-4 text-right">Real Purchasing Power</th>
                  <th className="py-2.5 px-4 text-right">Inflation-Adjusted Target</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {(projections || [])
                  .filter((_, idx) => idx % 2 === 0 || idx === (projections.length - 1))
                  .map((pt) => (
                    <tr
                      key={pt.year}
                      className={`hover:bg-[#FAFAF9] transition-colors ${
                        pt.isFireReached ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-bold text-[#1C1917]">
                        {pt.year === 0 ? 'Today (Year 0)' : `Year ${pt.year}`}
                      </td>
                      <td className="py-2.5 px-4 text-[#78716C] font-semibold">{pt.age} yrs</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={pt.nominalWealth} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-[#B45309] tabular-nums">
                        <Money amount={pt.realPurchasingPower} />
                      </td>
                      <td className="py-2.5 px-4 text-right text-[#78716C] tabular-nums font-semibold">
                        <Money amount={pt.targetFireNumber} />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {pt.isFireReached ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span>FIRE Ready 🎉</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#78716C] bg-stone-100 px-2 py-0.5 rounded">
                            Accumulating
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ASSUMPTIONS & STRATEGIC RECOMMENDATIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Assumptions Summary */}
        <div className="p-5 bg-white border border-[#E7E5E4] rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Standardized Assumptions Baseline</span>
            </div>
            <button
              type="button"
              onClick={onBackToInputs}
              className="text-[11px] font-bold text-[#B45309] hover:underline"
            >
              Adjust Parameters →
            </button>
          </div>

          <ul className="text-xs space-y-2 text-[#78716C]">
            <li className="flex justify-between border-b border-[#E7E5E4] pb-1.5">
              <span>Pre-Retirement Investment CAGR:</span>
              <span className="font-bold text-[#1C1917]">{expectedAnnualReturnPct}% p.a.</span>
            </li>
            <li className="flex justify-between border-b border-[#E7E5E4] pb-1.5">
              <span>Post-Retirement Return:</span>
              <span className="font-bold text-[#1C1917]">{postRetirementReturnPct}% p.a.</span>
            </li>
            <li className="flex justify-between border-b border-[#E7E5E4] pb-1.5">
              <span>Inflation Rate Benchmark:</span>
              <span className="font-bold text-[#1C1917]">{expectedAnnualInflationPct}% p.a.</span>
            </li>
            <li className="flex justify-between border-b border-[#E7E5E4] pb-1.5">
              <span>Safe Withdrawal Rate (SWR):</span>
              <span className="font-bold text-[#B45309]">{safeWithdrawalRatePct}% ({swrMultiple}x annual spend)</span>
            </li>
            <li className="flex justify-between">
              <span>Annual Living Expenses:</span>
              <span className="font-bold text-emerald-800"><Money amount={annualExpensesInRetirement} />/yr</span>
            </li>
          </ul>
        </div>

        {/* Strategic Levers & Cross-Module Shortcuts */}
        <div className="p-5 bg-white border border-[#E7E5E4] rounded-xl shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
              <TrendingUp className="h-4 w-4 text-[#C27D38]" />
              <span>Strategic Levers to Accelerate FIRE</span>
            </div>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Increasing monthly SIP savings by <strong>10%</strong> or trimming recurring lifestyle expenses by <strong>₹1,00,000/year</strong> reduces your target FIRE corpus by <strong>₹25,00,000</strong> and accelerates financial freedom by 2 to 4 years.
            </p>
          </div>

          {/* Cross-Module Quick Links */}
          {onNavigateToModule && (
            <div className="pt-3 border-t border-[#E7E5E4] flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigateToModule('portfolio-tracker')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C1917] bg-[#FAFAF9] hover:bg-stone-100 border border-[#E7E5E4] rounded-lg transition-colors"
              >
                <TrendingUp className="h-3.5 w-3.5 text-[#C27D38]" />
                <span>Portfolio Tracker</span>
                <ArrowRight className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateToModule('expense-tracker')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C1917] bg-[#FAFAF9] hover:bg-stone-100 border border-[#E7E5E4] rounded-lg transition-colors"
              >
                <Receipt className="h-3.5 w-3.5 text-[#1B6B44]" />
                <span>Expense Budget</span>
                <ArrowRight className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateToModule('net-worth-tracker')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1C1917] bg-[#FAFAF9] hover:bg-stone-100 border border-[#E7E5E4] rounded-lg transition-colors"
              >
                <Layers className="h-3.5 w-3.5 text-stone-700" />
                <span>Net Worth Balance</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FireSummaryTab;
