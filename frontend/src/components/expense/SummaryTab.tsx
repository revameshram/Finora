import React from 'react';
import { ExpenseTransaction, ExpenseDashboardMetrics, EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '../../types/expense';
import { Money } from '../shared';
import { PieChart, CheckCircle2, Clock } from 'lucide-react';

interface SummaryTabProps {
  transactions: ExpenseTransaction[];
  metrics: ExpenseDashboardMetrics | null;
  budgetMonth: string;
}

const CATEGORY_COLORS = [
  '#B45309', // amber
  '#D97706', // light amber
  '#334155', // slate
  '#475569', // cool slate
  '#BE123C', // rose
  '#E11D48', // bright rose
  '#0284C7', // sky
  '#0D9488', // teal
  '#7C3AED', // purple
  '#65A30D', // lime
  '#D97706', // gold
  '#78716C', // stone
];

export const SummaryTab: React.FC<SummaryTabProps> = ({ transactions, metrics, budgetMonth }) => {
  const includedTxns = transactions.filter((t) => t.isIncluded);
  const totalOutflow = includedTxns.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryGroups = includedTxns.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryGroups)
    .map(([cat, amount], idx) => ({
      category: cat as ExpenseCategory,
      label: EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] || cat,
      amount,
      percentage: totalOutflow > 0 ? (amount / totalOutflow) * 100 : 0,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  // Status breakdown
  const doneAmount = includedTxns.filter((t) => t.status === 'DONE').reduce((s, t) => s + t.amount, 0);
  const pendingAmount = includedTxns.filter((t) => t.status === 'PENDING').reduce((s, t) => s + t.amount, 0);
  const doneCount = includedTxns.filter((t) => t.status === 'DONE').length;
  const pendingCount = includedTxns.filter((t) => t.status === 'PENDING').length;

  const donePct = totalOutflow > 0 ? (doneAmount / totalOutflow) * 100 : 0;
  const pendingPct = totalOutflow > 0 ? (pendingAmount / totalOutflow) * 100 : 0;

  // Simple SVG Donut generator
  const renderDonut = (slices: { percentage: number; color: string }[]) => {
    let accumulated = 0;
    return (
      <svg viewBox="0 0 36 36" className="w-36 h-36 transform -rotate-90">
        {slices.map((slice, i) => {
          const strokeDasharray = `${slice.percentage} ${100 - slice.percentage}`;
          const strokeDashoffset = -accumulated;
          accumulated += slice.percentage;

          return (
            <circle
              key={i}
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="4"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Summary Header */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs">
          <div className="p-3.5 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4]">
            <span className="text-xs font-semibold text-[#78716C] block">Monthly Inflow</span>
            <div className="text-xl font-serif font-bold text-[#1C1917] mt-1">
              <Money amount={metrics.totalInflow} />
            </div>
            <span className="text-[11px] text-[#78716C] block mt-0.5">{budgetMonth} Revenue</span>
          </div>

          <div className="p-3.5 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4]">
            <span className="text-xs font-semibold text-[#78716C] block">Total Outflows</span>
            <div className="text-xl font-bold text-[#BE123C] mt-1">
              <Money amount={metrics.totalOutflow} />
            </div>
            <span className="text-[11px] text-[#78716C] block mt-0.5">Committed Spend</span>
          </div>

          <div className="p-3.5 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4]">
            <span className="text-xs font-semibold text-[#78716C] block">Net Savings</span>
            <div className="text-xl font-bold text-[#1C1917] mt-1">
              <Money amount={metrics.cashFlow} />
            </div>
            <span className="text-[11px] text-[#B45309] block mt-0.5">
              {metrics.totalInflow > 0
                ? `${Math.round((metrics.cashFlow / metrics.totalInflow) * 100)}% savings rate`
                : '0% rate'}
            </span>
          </div>

          <div className="p-3.5 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4]">
            <span className="text-xs font-semibold text-[#78716C] block">Settled Position</span>
            <div className="text-xl font-bold text-[#1C1917] mt-1">
              <Money amount={metrics.netPosition} />
            </div>
            <span className="text-[11px] text-[#78716C] block mt-0.5">Settled Liquid Cash</span>
          </div>
        </div>
      )}

      {/* Donut Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#E7E5E4] pb-3">
            <PieChart className="h-4 w-4 text-[#B45309]" />
            <h3 className="text-sm font-bold text-[#1C1917]">Category Spending Distribution</h3>
          </div>

          {categoryData.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#78716C]">
              No transactions recorded for category breakdown.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex-shrink-0 flex items-center justify-center">
                {renderDonut(categoryData.map((d) => ({ percentage: d.percentage, color: d.color })))}
                <div className="absolute text-center">
                  <span className="text-[10px] text-[#78716C] block">Outflow</span>
                  <span className="text-xs font-bold text-[#1C1917] block">
                    <Money amount={totalOutflow} />
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 max-h-56 overflow-y-auto w-full pr-1">
                {categoryData.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[#1C1917] font-medium truncate">{cat.label}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-bold text-[#1C1917] tabular-nums">
                        <Money amount={cat.amount} />
                      </span>
                      <span className="text-[10px] text-[#78716C] ml-1.5 tabular-nums">
                        ({cat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transaction Settlement Status Donut */}
        <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#E7E5E4] pb-3">
            <Clock className="h-4 w-4 text-[#B45309]" />
            <h3 className="text-sm font-bold text-[#1C1917]">Settlement State (Done vs Pending)</h3>
          </div>

          {totalOutflow === 0 ? (
            <div className="p-8 text-center text-xs text-[#78716C]">
              No transactions recorded for settlement analysis.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex-shrink-0 flex items-center justify-center">
                {renderDonut([
                  { percentage: donePct, color: '#1C1917' },
                  { percentage: pendingPct, color: '#B45309' },
                ])}
                <div className="absolute text-center">
                  <span className="text-[10px] text-[#78716C] block">Total</span>
                  <span className="text-xs font-bold text-[#1C1917] block">
                    {doneCount + pendingCount} items
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div className="p-3 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#1C1917]" />
                    <div>
                      <div className="text-xs font-bold text-[#1C1917]">Settled (Done)</div>
                      <span className="text-[10px] text-[#78716C]">{doneCount} transactions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#1C1917]">
                      <Money amount={doneAmount} />
                    </div>
                    <span className="text-[10px] text-[#78716C] tabular-nums">({donePct.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#B45309]" />
                    <div>
                      <div className="text-xs font-bold text-[#1C1917]">Pending (Scheduled)</div>
                      <span className="text-[10px] text-[#78716C]">{pendingCount} transactions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#B45309]">
                      <Money amount={pendingAmount} />
                    </div>
                    <span className="text-[10px] text-[#78716C] tabular-nums">({pendingPct.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
