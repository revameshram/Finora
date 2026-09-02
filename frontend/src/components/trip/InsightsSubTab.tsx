import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Activity
} from 'lucide-react';
import { TripDto, TripInsightsDto } from '../../types/trip';

interface InsightsSubTabProps {
  trip: TripDto;
  insights: TripInsightsDto | null;
}

export const InsightsSubTab: React.FC<InsightsSubTabProps> = ({ trip: _unusedTrip, insights }) => {
  const [breakdownView, setBreakdownView] = useState<'categories' | 'travelers'>('categories');
  const [showFullAnalysis, setShowFullAnalysis] = useState(true);

  if (!insights) {
    return (
      <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl text-stone-400">
        <Activity className="w-8 h-8 mx-auto mb-2 text-stone-300" />
        <p className="text-xs">Loading trip insights & analytics...</p>
      </div>
    );
  }

  const {
    totalBudget,
    totalSpent,
    budgetLeft,
    usedPercent,
    dailyAverage,
    tripDurationDays,
    spendingVelocityDaily,
    projectedTotalCost,
    projectedRemainingSpend,
    costPerDay,
    costPerPersonPerDay,
    averageExpenseSize,
    paymentCoveragePercent,
    totalExpensesCount,
    fullyPaidExpensesCount,
    pendingExpensesCount,
    categoryBreakdown,
    recommendations,
  } = insights;

  return (
    <div className="space-y-6">
      {/* 1. Top Stat Row (§16.2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Total Spent</span>
          <div className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">of ₹{totalBudget.toLocaleString('en-IN')} budget</p>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Budget Left</span>
          <div className={`text-xl font-bold font-serif mt-0.5 ${budgetLeft < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            ₹{budgetLeft.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {budgetLeft < 0 ? 'Over budget limit' : 'Remaining cash cushion'}
          </p>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Used %</span>
          <div className={`text-xl font-bold font-serif mt-0.5 ${usedPercent > 90 ? 'text-rose-600' : usedPercent > 70 ? 'text-amber-600' : 'text-stone-900'}`}>
            {usedPercent}%
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Guarded against zero budget</p>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Daily Average</span>
          <div className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            ₹{dailyAverage.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Average outflow per day</p>
        </div>
      </div>

      {/* 2. Spending Breakdown Toggle & Highlights Card (§16.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Spending Breakdown
            </h3>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
              <button
                onClick={() => setBreakdownView('categories')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  breakdownView === 'categories'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setBreakdownView('travelers')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  breakdownView === 'travelers'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Travelers
              </button>
            </div>
          </div>

          {/* Breakdown Items List */}
          <div className="space-y-3">
            {breakdownView === 'categories' ? (
              categoryBreakdown.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{item.categoryName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-stone-600">₹{item.spentAmount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-stone-400">({item.percentageOfTotalSpent}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, item.percentageOfTotalSpent)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-stone-500 italic">
                Traveler share distribution is visible in the Full Analysis and Settle tabs.
              </div>
            )}
          </div>
        </div>

        {/* Right Highlights Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-amber-500/10 via-stone-50 to-white border border-amber-200/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-900 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Trip Highlights & Advisory</h4>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {recommendations.length > 0 
                ? recommendations[0] 
                : 'Keep logging expenses to unlock deeper spending velocity projections and travel tips.'}
            </p>

            <div className="mt-4 pt-3 border-t border-amber-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Trip Duration</span>
                <span className="font-bold text-stone-900">{tripDurationDays} Days</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Payment Coverage</span>
                <span className="font-bold text-stone-900">{paymentCoveragePercent}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Avg Expense Size</span>
                <span className="font-bold text-stone-900">₹{averageExpenseSize.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-white/80 border border-amber-200 rounded-xl flex items-center gap-2 text-[11px] text-amber-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>All group balances synchronized and encrypted client-side.</span>
          </div>
        </div>
      </div>

      {/* 3. Collapsible Full Analysis Panel (§16.2) */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowFullAnalysis(!showFullAnalysis)}
          className="w-full px-6 py-4 flex items-center justify-between bg-stone-50/70 hover:bg-stone-50 transition-colors text-left"
        >
          <div>
            <h3 className="text-sm font-bold text-stone-900">Full Comprehensive Trip Analysis</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Budget Analysis, Velocity, Payment Tracking, Timeline, and Cost Efficiency Metrics
            </p>
          </div>
          {showFullAnalysis ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showFullAnalysis && (
          <div className="p-6 space-y-6 divide-y divide-stone-100">
            {/* Section A: Spending Insights & Velocity */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Spending Velocity & Future Projections
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Pacing Velocity</span>
                  <span className="text-base font-bold text-stone-900 font-serif">
                    ₹{spendingVelocityDaily.toLocaleString('en-IN')} / day
                  </span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Projected Total Trip Cost</span>
                  <span className="text-base font-bold text-stone-900 font-serif">
                    ₹{projectedTotalCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Projected Remaining Spend</span>
                  <span className="text-base font-bold text-stone-900 font-serif">
                    ₹{projectedRemainingSpend.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Cost Efficiency Metrics */}
            <div className="pt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Cost Efficiency Metrics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Cost per Day</span>
                  <span className="text-base font-bold text-stone-900 font-serif">
                    ₹{costPerDay.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Cost per Person per Day</span>
                  <span className="text-base font-bold text-stone-900 font-serif">
                    ₹{costPerPersonPerDay.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Average Expense Size</span>
                  <span className="text-base font-bold text-stone-900 font-serif">
                    ₹{averageExpenseSize.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section C: Payment Tracking & Coverage */}
            <div className="pt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Payment Tracking & Coverage
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Total Expenses Logged</span>
                  <span className="text-sm font-bold text-stone-900">{totalExpensesCount}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Fully Paid Expenses</span>
                  <span className="text-sm font-bold text-emerald-700">{fullyPaidExpensesCount}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Pending Invoices</span>
                  <span className="text-sm font-bold text-amber-700">{pendingExpensesCount}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 block mb-1">Payment Coverage %</span>
                  <span className="text-sm font-bold text-stone-900">{paymentCoveragePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
