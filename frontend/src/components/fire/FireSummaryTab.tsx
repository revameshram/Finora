import React from 'react';
import { Flame, TrendingUp, ShieldCheck, DollarSign, ArrowUpRight, BarChart2 } from 'lucide-react';
import { Money } from '../shared';

interface FireGrowthProjectionPoint {
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
  projections: FireGrowthProjectionPoint[];
  monthlySavings: number;
  expectedAnnualReturnPct: number;
  expectedAnnualInflationPct: number;
  safeWithdrawalRatePct: number;
}

export const FireSummaryTab: React.FC<FireSummaryTabProps> = ({
  fireNumber,
  effectiveCurrentSavings,
  currentProgressPercentage,
  projections,
  monthlySavings,
  expectedAnnualReturnPct,
  expectedAnnualInflationPct,
  safeWithdrawalRatePct,
}) => {
  const maxVal = Math.max(
    ...projections.map((p) => Math.max(p.nominalWealth, p.targetFireNumber)),
    100000
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Target vs Current Progress Bar Chart */}
      <div className="p-6 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#B88728]" />
            <h3 className="text-base font-semibold text-[#F3F6F3]">FIRE Corpus Accumulation Progress</h3>
          </div>
          <span className="text-xs font-bold text-[#B88728]">{currentProgressPercentage}% Achieved</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-[#8DA698] bg-[#12241C] p-4 rounded-lg border border-[#1E382B]">
          <div>
            <span>Current Wealth Base:</span>
            <p className="text-lg font-bold text-[#F3F6F3] mt-0.5"><Money amount={effectiveCurrentSavings} /></p>
          </div>
          <div>
            <span>Target FIRE Number (25x):</span>
            <p className="text-lg font-bold text-[#B88728] mt-0.5"><Money amount={fireNumber} /></p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-[#12241C] border border-[#2D4A3E] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#1B6B44] via-[#B88728] to-[#1B6B44] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, currentProgressPercentage)}%` }}
          />
        </div>
      </div>

      {/* Dual-Line Wealth Projection Chart Table */}
      <div className="p-6 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#F3F6F3]">Savings Growth & Inflation Projection (30 Years)</h3>
            <p className="text-xs text-[#8DA698]">Comparing Nominal Wealth vs Real Purchasing Power discounted @ {expectedAnnualInflationPct}% inflation</p>
          </div>
        </div>

        <div className="border border-[#1E382B] rounded-lg overflow-hidden bg-[#12241C]">
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#0E1B15] border-b border-[#1E382B] text-[11px] font-semibold text-[#8DA698] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Horizon</th>
                  <th className="p-3">Age</th>
                  <th className="p-3 text-right">Nominal Projected Wealth</th>
                  <th className="p-3 text-right">Real Purchasing Power</th>
                  <th className="p-3 text-right">Inflation-Adjusted Target</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E382B]">
                {projections.filter((_, idx) => idx % 2 === 0 || idx === 30).map((pt) => (
                  <tr key={pt.year} className={`hover:bg-[#1A3327] ${pt.isFireReached ? 'bg-[#1B6B44]/10' : ''}`}>
                    <td className="p-3 font-medium text-[#F3F6F3]">{pt.year === 0 ? 'Today' : `Year ${pt.year}`}</td>
                    <td className="p-3 text-[#8DA698]">{pt.age} yrs</td>
                    <td className="p-3 text-right font-semibold text-[#F3F6F3]"><Money amount={pt.nominalWealth} /></td>
                    <td className="p-3 text-right font-medium text-[#B88728]"><Money amount={pt.realPurchasingPower} /></td>
                    <td className="p-3 text-right text-[#8DA698]"><Money amount={pt.targetFireNumber} /></td>
                    <td className="p-3 text-center">
                      {pt.isFireReached ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B6B44]/20 border border-[#1B6B44]/40 text-[#1B6B44]">
                          FIRE Ready 🎉
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6B8576]">Accumulating</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Savings Breakdown & Strategic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F3F6F3]">
            <ShieldCheck className="w-4 h-4 text-[#1B6B44]" />
            <span>Key Assumptions Summary</span>
          </div>
          <ul className="text-xs text-[#8DA698] space-y-2">
            <li className="flex justify-between border-b border-[#1E382B] pb-1.5">
              <span>Pre-Retirement Investment CAGR:</span>
              <span className="font-semibold text-[#F3F6F3]">{expectedAnnualReturnPct}%</span>
            </li>
            <li className="flex justify-between border-b border-[#1E382B] pb-1.5">
              <span>Expected Inflation Benchmark:</span>
              <span className="font-semibold text-[#F3F6F3]">{expectedAnnualInflationPct}%</span>
            </li>
            <li className="flex justify-between border-b border-[#1E382B] pb-1.5">
              <span>Safe Withdrawal Rate (SWR):</span>
              <span className="font-semibold text-[#B88728]">{safeWithdrawalRatePct}% ({Math.round(100/safeWithdrawalRatePct)}x)</span>
            </li>
            <li className="flex justify-between">
              <span>Monthly Savings Rate:</span>
              <span className="font-semibold text-[#1B6B44]"><Money amount={monthlySavings} />/mo</span>
            </li>
          </ul>
        </div>

        <div className="p-5 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F3F6F3]">
            <TrendingUp className="w-4 h-4 text-[#B88728]" />
            <span>Accelerate Your Path to FIRE</span>
          </div>
          <p className="text-xs text-[#8DA698]">
            Increasing your monthly savings by just <strong>10%</strong> or reducing annual living expenses by <strong>₹1,00,000</strong> lowers your target FIRE number by <strong>₹25,00,000</strong> and shortens your timeline by 2–4 years.
          </p>
        </div>
      </div>
    </div>
  );
};
