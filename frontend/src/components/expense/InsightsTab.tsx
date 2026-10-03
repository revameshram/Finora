import React from 'react';
import { ExpenseInsights } from '../../types/expense';
import { Money, InsightsCard } from '../shared';
import { ShieldCheck, TrendingUp, AlertCircle, Zap, Activity } from 'lucide-react';

interface InsightsTabProps {
  insights: ExpenseInsights | null;
  budgetMonth: string;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({ insights, budgetMonth }) => {
  if (!insights) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-[#E7E5E4] text-xs text-[#78716C]">
        Loading financial health diagnostics for {budgetMonth}...
      </div>
    );
  }

  const score = insights.financialHealthScore;
  const scoreColor =
    score >= 80 ? 'text-[#B45309]' : score >= 60 ? 'text-[#1C1917]' : 'text-[#BE123C]';

  return (
    <div className="space-y-6">
      {/* Financial Health Diagnostic Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E7E5E4] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#B45309]" />
              <h3 className="text-sm font-bold text-[#1C1917]">
                Monthly Financial Health Diagnostic
              </h3>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">
              Multi-factor assessment evaluating savings discipline, outflow ratio, and cash drag.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider block">
                Health Score
              </span>
              <span className={`text-2xl font-serif font-bold ${scoreColor} tabular-nums`}>
                {score} / 100
              </span>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-md border ${
                score >= 80
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30'
                  : score >= 60
                  ? 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]'
                  : 'bg-[#FFE4E6] text-[#BE123C] border-[#BE123C]/30'
              }`}
            >
              {insights.healthBadge}
            </span>
          </div>
        </div>

        {/* Ratio Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-3.5 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#78716C]">Savings Rate</span>
              <span className="font-bold text-[#1C1917] tabular-nums">{insights.savingsRate}%</span>
            </div>
            <div className="w-full bg-[#E7E5E4] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#B45309] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, insights.savingsRate))}%` }}
              />
            </div>
            <span className="text-[10px] text-[#78716C] block">Benchmark: ≥ 20%</span>
          </div>

          <div className="p-3.5 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#78716C]">Expense Ratio</span>
              <span className="font-bold text-[#1C1917] tabular-nums">{insights.expenseRatio}%</span>
            </div>
            <div className="w-full bg-[#E7E5E4] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1C1917] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, insights.expenseRatio))}%` }}
              />
            </div>
            <span className="text-[10px] text-[#78716C] block">Target: ≤ 60%</span>
          </div>

          <div className="p-3.5 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#78716C]">Pending Drag</span>
              <span className="font-bold text-[#1C1917] tabular-nums">{insights.pendingRatio}%</span>
            </div>
            <div className="w-full bg-[#E7E5E4] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#BE123C] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, insights.pendingRatio))}%` }}
              />
            </div>
            <span className="text-[10px] text-[#78716C] block">Unsettled Outflows</span>
          </div>
        </div>
      </div>

      {/* Deep Insights Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
            <ShieldCheck className="h-4 w-4 text-[#B45309]" />
            <span>6-Month Emergency Fund Target</span>
          </div>
          <div className="text-xl font-serif font-bold text-[#1C1917]">
            <Money amount={insights.emergencyFundTarget} />
          </div>
          <p className="text-[11px] text-[#78716C]">
            Recommended liquid cushion based on current committed monthly burn.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
            <Zap className="h-4 w-4 text-[#B45309]" />
            <span>Cash Flow Velocity</span>
          </div>
          <div className="text-xl font-bold text-[#1C1917] tabular-nums">
            <Money amount={insights.cashFlowVelocity} />
            <span className="text-xs text-[#78716C] font-normal ml-1">/ day</span>
          </div>
          <p className="text-[11px] text-[#78716C]">
            Average net liquid accumulation pacing across 30 active days.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
            <TrendingUp className="h-4 w-4 text-[#B45309]" />
            <span>Primary Revenue Anchor</span>
          </div>
          <div className="text-xl font-bold text-[#1C1917]">
            <Money amount={insights.largestIncomeAmount} />
          </div>
          <p className="text-[11px] text-[#78716C] truncate">
            Source: <span className="font-semibold text-[#1C1917]">{insights.largestIncomeName}</span>
          </p>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#B45309]" />
          <h3 className="text-xs font-bold text-[#1C1917]">
            Automated Cash Flow Insights & Advisory
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.recommendations.map((rec, i) => (
            <InsightsCard
              key={i}
              type={rec.toLowerCase().includes('critical') ? 'critical' : rec.toLowerCase().includes('excellent') ? 'positive' : 'warning'}
              title={`Insight #${i + 1}`}
              description={rec}
              sourceModule="EXPENSE"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsTab;
