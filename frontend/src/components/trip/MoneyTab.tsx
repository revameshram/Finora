import React, { useState } from 'react';
import { 
  IndianRupee, 
  CreditCard, 
  Scale, 
  TrendingUp 
} from 'lucide-react';
import { 
  TripDto, 
  TripCategoryBudgetDto, 
  TripExpenseDto, 
  TripParticipantDto, 
  TripInsightsDto 
} from '../../types/trip';
import { BudgetSubTab } from './BudgetSubTab';
import { ExpensesSubTab } from './ExpensesSubTab';
import { SettleSubTab } from './SettleSubTab';
import { InsightsSubTab } from './InsightsSubTab';

interface MoneyTabProps {
  trip: TripDto;
  categoryBudgets: TripCategoryBudgetDto[];
  expenses: TripExpenseDto[];
  participants: TripParticipantDto[];
  insights: TripInsightsDto | null;
  activeSubTab?: string;
  onRefresh: () => void;
}

export const MoneyTab: React.FC<MoneyTabProps> = ({
  trip,
  categoryBudgets,
  expenses,
  participants,
  insights,
  activeSubTab = 'budget',
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'budget' | 'expenses' | 'settle' | 'insights'>(
    (activeSubTab as any) || 'budget'
  );

  const spent = trip.totalSpent || 0;
  const budget = trip.totalBudget || 0;
  const usedPct = insights ? insights.usedPercent : (budget > 0 ? Math.round((spent / budget) * 100) : 0);
  const left = Math.max(0, budget - spent);

  return (
    <div className="space-y-6">
      {/* Persistent Trip Spend Header Bar (§16.2) */}
      <div className="p-5 bg-white border border-stone-200 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Trip Spend Tracker
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-serif text-stone-900">
                ₹{spent.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                spent of {budget > 0 ? `₹${budget.toLocaleString('en-IN')}` : '₹0'} budget
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-stone-500 block">Budget Left</span>
              <span className={`text-base font-bold font-serif ${budget > 0 && spent > budget ? 'text-rose-600' : 'text-emerald-700'}`}>
                ₹{left.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-stone-500 block">Used %</span>
              <span className="text-base font-bold font-serif text-stone-900">
                {usedPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Header Progress Bar */}
        {budget > 0 && (
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all ${
                usedPct > 90 ? 'bg-rose-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, usedPct)}%` }}
            />
          </div>
        )}

        {/* 4 Sub-Tabs Navigation Strip (§16.2) */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-stone-100 overflow-x-auto">
          <button
            onClick={() => setSubTab('budget')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'budget'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            Budget
          </button>
          <button
            onClick={() => setSubTab('expenses')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'expenses'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setSubTab('settle')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'settle'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Settle
          </button>
          <button
            onClick={() => setSubTab('insights')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'insights'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Insights
          </button>
        </div>
      </div>

      {/* Active Sub-Tab View */}
      {subTab === 'budget' && (
        <BudgetSubTab
          trip={trip}
          categoryBudgets={categoryBudgets}
          insights={insights}
          onRefresh={onRefresh}
        />
      )}

      {subTab === 'expenses' && (
        <ExpensesSubTab
          trip={trip}
          expenses={expenses}
          participants={participants}
          onRefresh={onRefresh}
        />
      )}

      {subTab === 'settle' && (
        <SettleSubTab
          trip={trip}
          participants={participants}
          onRefresh={onRefresh}
        />
      )}

      {subTab === 'insights' && (
        <InsightsSubTab
          trip={trip}
          insights={insights}
        />
      )}
    </div>
  );
};
