import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Plane,
  Building,
  Utensils,
  Compass,
  ShoppingBag,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { TripDto, TripCategoryBudgetDto, TripCategory, TripInsightsDto } from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';

interface BudgetSubTabProps {
  trip: TripDto;
  categoryBudgets: TripCategoryBudgetDto[];
  insights: TripInsightsDto | null;
  onRefresh: () => void;
}

export const BudgetSubTab: React.FC<BudgetSubTabProps> = ({
  trip,
  categoryBudgets,
  insights,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [isEditingOverall, setIsEditingOverall] = useState(false);
  const [overallBudgetInput, setOverallBudgetInput] = useState(trip.totalBudget ? trip.totalBudget.toString() : '');
  const [editingCat, setEditingCat] = useState<TripCategory | null>(null);
  const [catBudgetInput, setCatBudgetInput] = useState('');
  const [showBudgetVsPlanTable, setShowBudgetVsPlanTable] = useState(true);

  const handleSaveOverallBudget = async () => {
    try {
      await tripApi.updateTrip(trip.id, {
        totalBudget: overallBudgetInput ? Number(overallBudgetInput) : 0,
      });
      toast.success('Overall trip budget updated!');
      setIsEditingOverall(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not update budget');
    }
  };

  const handleSaveCatBudget = async (category: TripCategory) => {
    try {
      await tripApi.setCategoryBudget(trip.id, {
        category,
        budgetAmount: catBudgetInput ? Number(catBudgetInput) : 0,
      });
      toast.success('Category budget saved!');
      setEditingCat(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not save category budget');
    }
  };

  const getCategoryIcon = (cat: TripCategory) => {
    switch (cat) {
      case 'TRANSPORTATION': return <Plane className="w-4 h-4 text-blue-600" />;
      case 'ACCOMMODATION': return <Building className="w-4 h-4 text-purple-600" />;
      case 'FOOD_DINING': return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'ACTIVITIES_ENTERTAINMENT': return <Compass className="w-4 h-4 text-emerald-600" />;
      case 'SHOPPING': return <ShoppingBag className="w-4 h-4 text-rose-600" />;
      case 'TOUR_OPERATOR': return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      default: return <Layers className="w-4 h-4 text-stone-600" />;
    }
  };

  const getCategoryDisplayName = (cat: TripCategory) => {
    switch (cat) {
      case 'TRANSPORTATION': return 'Transportation';
      case 'ACCOMMODATION': return 'Accommodation';
      case 'FOOD_DINING': return 'Food & Dining';
      case 'ACTIVITIES_ENTERTAINMENT': return 'Activities & Entertainment';
      case 'SHOPPING': return 'Shopping';
      case 'TOUR_OPERATOR': return 'Tour Operator';
      case 'MISCELLANEOUS': return 'Miscellaneous';
    }
  };

  const totalAllocatedCategoryBudget = categoryBudgets.reduce((sum, b) => sum + (b.budgetAmount || 0), 0);
  const totalActualSpent = trip.totalSpent || 0;
  const overallBudget = trip.totalBudget || 0;
  const overallUtilPercent = overallBudget > 0 
    ? Math.min(100, Math.round((totalActualSpent / overallBudget) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* 3 Summary Cards (§16.2 / §16.5) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Projected Reality */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            <span>Projected Reality</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-serif text-stone-900">
            ₹{insights ? insights.projectedTotalCost.toLocaleString('en-IN') : totalActualSpent.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Projected total based on current daily spending velocity
          </p>
        </div>

        {/* Card 2: Spending Status */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            <span>Spending Status</span>
            {overallUtilPercent > 90 ? (
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="text-xl font-bold text-stone-900">
            {overallBudget > 0 ? (
              insights?.budgetPacingStatus === 'OVER_BUDGET' ? (
                <span className="text-rose-600">Over Budget Pace</span>
              ) : (
                <span className="text-emerald-700">On Track ({overallUtilPercent}%)</span>
              )
            ) : (
              <span className="text-stone-500">Unbudgeted</span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {overallBudget > 0 
              ? `₹${Math.max(0, overallBudget - totalActualSpent).toLocaleString('en-IN')} remaining of ₹${overallBudget.toLocaleString('en-IN')}`
              : 'Set a budget to unlock automatic pace monitoring'}
          </p>
        </div>

        {/* Card 3: Market Allocations */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            <span>Allocated vs Target</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl font-bold font-serif text-stone-900">
            ₹{totalAllocatedCategoryBudget.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {overallBudget > 0 
              ? `${Math.round((totalAllocatedCategoryBudget / Math.max(1, overallBudget)) * 100)}% distributed across 7 categories`
              : 'Total category allocations configured'}
          </p>
        </div>
      </div>

      {/* Overall Budget Control Header */}
      <div className="p-5 bg-white border border-stone-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Trip Overall Cap
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold font-serif text-stone-900">
              ₹{overallBudget.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500">
              ({overallUtilPercent}% spent • ₹{(totalActualSpent).toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        {isEditingOverall ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min="0"
              value={overallBudgetInput}
              onChange={(e) => setOverallBudgetInput(e.target.value)}
              placeholder="e.g. 450000"
              className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 w-36 focus:outline-none"
            />
            <button
              onClick={handleSaveOverallBudget}
              className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditingOverall(false)}
              className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setOverallBudgetInput(trip.totalBudget ? trip.totalBudget.toString() : '');
              setIsEditingOverall(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
          >
            Edit Overall Budget
          </button>
        )}
      </div>

      {/* 7 Fixed Categories Budgets Grid */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900">7-Category Budget Allocations</h3>
            <p className="text-xs text-stone-500 mt-0.5">Fixed standard travel expense breakdown (§16.2 / §16.5)</p>
          </div>
          <button
            onClick={() => setShowBudgetVsPlanTable(!showBudgetVsPlanTable)}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            {showBudgetVsPlanTable ? 'Hide Table View' : 'Show Budget vs Plan Table'}
            {showBudgetVsPlanTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Categories Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {categoryBudgets.map((cb) => {
            const spent = cb.actualSpent || 0;
            const budget = cb.budgetAmount || 0;
            const util = cb.utilizationPercent || 0; // Guaranteed null-guarded

            return (
              <div key={cb.category} className="p-4 bg-stone-50/80 border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center">
                      {getCategoryIcon(cb.category)}
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      {getCategoryDisplayName(cb.category)}
                    </span>
                  </div>

                  {editingCat === cb.category ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={catBudgetInput}
                        onChange={(e) => setCatBudgetInput(e.target.value)}
                        className="w-20 px-2 py-1 text-xs bg-white border border-stone-200 rounded text-stone-900"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => handleSaveCatBudget(cb.category)}
                        className="px-2 py-1 text-[10px] font-bold bg-amber-600 text-white rounded"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingCat(null)}
                        className="text-stone-400 hover:text-stone-700 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCat(cb.category);
                        setCatBudgetInput(budget ? budget.toString() : '');
                      }}
                      className="text-[11px] font-semibold text-amber-700 hover:underline"
                    >
                      {budget > 0 ? `₹${budget.toLocaleString('en-IN')}` : '+ Set Budget'}
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span>Spent: ₹{spent.toLocaleString('en-IN')}</span>
                    <span className="font-bold text-stone-800">{util}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        util > 100 ? 'bg-rose-500' : util > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Budget vs Plan Table (§16.5) */}
        {showBudgetVsPlanTable && (
          <div className="mt-6 pt-5 border-t border-stone-200 overflow-x-auto">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
              Budget vs Plan Breakdown Table
            </h4>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600 uppercase">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Budget Limit</th>
                  <th className="py-2.5 px-3 text-right">Actual Spent</th>
                  <th className="py-2.5 px-3 text-right">Remaining</th>
                  <th className="py-2.5 px-3 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categoryBudgets.map((cb) => {
                  const spent = cb.actualSpent || 0;
                  const budget = cb.budgetAmount || 0;
                  const remaining = budget - spent;
                  const util = cb.utilizationPercent || 0;

                  return (
                    <tr key={cb.category} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-900 flex items-center gap-2">
                        {getCategoryIcon(cb.category)}
                        {getCategoryDisplayName(cb.category)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                        ₹{budget.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        ₹{spent.toLocaleString('en-IN')}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono ${remaining < 0 ? 'text-rose-600 font-bold' : 'text-stone-600'}`}>
                        ₹{remaining.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          util > 100 
                            ? 'bg-rose-100 text-rose-800' 
                            : util > 80 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {util}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300 font-bold bg-stone-50/70">
                  <td className="py-3 px-3 text-stone-900">Total Group Spending</td>
                  <td className="py-3 px-3 text-right font-mono text-stone-900">₹{overallBudget.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono text-amber-900 font-bold">₹{totalActualSpent.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono text-stone-900">₹{(overallBudget - totalActualSpent).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-mono text-stone-900">{overallUtilPercent}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
