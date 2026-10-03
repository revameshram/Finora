import React, { useState } from 'react';
import { X, Target, CheckCircle, PauseCircle, Archive, Trash2, PlusCircle, CheckSquare, Square } from 'lucide-react';
import { Money } from '../shared';

interface GoalContribution {
  id: string;
  goalId: string;
  goalName: string;
  type: 'CONTRIBUTION' | 'WITHDRAWAL';
  amount: number;
  date: string;
  note?: string;
  sourceType: string;
}

interface GoalMilestone {
  id: string;
  label: string;
  targetPct: number;
  isAchieved: boolean;
  achievedAt?: string;
}

interface GoalTrajectoryPoint {
  date: string;
  plannedAmount: number;
  actualAmount: number;
  gapAmount: number;
  gapPercentage: number;
}

interface GoalDetailData {
  goal: {
    id: string;
    name: string;
    category: string;
    priority: string;
    targetAmount: number;
    targetIsFutureValue: boolean;
    adjustedFutureValue: number;
    targetDate: string;
    daysRemaining: number;
    inflationRatePct: number;
    expectedAnnualReturnPct: number;
    startingBalance: number;
    accountLabel?: string;
    currentValue: number;
    progressPercentage: number;
    requiredMonthlyContribution: number;
    status: 'ACTIVE' | 'BEHIND' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    notes?: string;
  };
  history: GoalContribution[];
  milestones: GoalMilestone[];
  trajectory: GoalTrajectoryPoint[];
  linkedPortfolioAssetIds: string[];
}

interface GoalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GoalDetailData | null;
  onStatusChange: (goalId: string, status: string) => void;
  onDelete: (goalId: string) => void;
  onOpenContribute: (goalId: string, name: string) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  onStatusChange,
  onDelete,
  onOpenContribute,
}) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'TRAJECTORY' | 'MILESTONES'>('TRAJECTORY');

  if (!isOpen || !data) return null;

  const { goal, history, milestones, trajectory } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">Completed 🎉</span>;
      case 'BEHIND':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700">Behind Pace</span>;
      case 'PAUSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800">Paused</span>;
      case 'ARCHIVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 border border-stone-200 text-stone-600">Archived</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">On Track</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white text-[#1C1917] border border-[#E7E5E4] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B88728]/10 border border-[#B88728]/30 text-[#B88728]">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-serif text-[#1C1917]">{goal.name}</h2>
                {getStatusBadge(goal.status)}
              </div>
              <p className="text-xs text-[#78716C] mt-0.5">
                Target Date: <span className="text-[#1C1917] font-semibold">{goal.targetDate}</span> ({goal.daysRemaining} days left)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Target Value Banner: Today's Money -> Adj. FV */}
          <div className="p-4 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl grid grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#78716C]">Target (Today's Money)</span>
              <p className="text-lg font-bold text-[#1C1917] mt-0.5"><Money amount={goal.targetAmount} /></p>
            </div>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#78716C]">Inflation-Adjusted Target</span>
              <p className="text-lg font-bold text-[#B88728] mt-0.5"><Money amount={goal.adjustedFutureValue} /></p>
              <span className="text-[10px] text-[#A8A29E]">Compounded @ {goal.inflationRatePct}% inflation</span>
            </div>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#78716C]">Required Monthly Rate</span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5"><Money amount={goal.requiredMonthlyContribution} /><span className="text-xs font-normal text-[#78716C]">/mo</span></p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#78716C] font-medium">Saved: <span className="text-[#1C1917] font-bold"><Money amount={goal.currentValue} /></span></span>
              <span className="text-[#B88728] font-bold">{goal.progressPercentage}% Complete</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 border border-[#E7E5E4] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 via-[#B88728] to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
              />
            </div>
          </div>

          {/* Actions & Manage Toolbar */}
          <div className="flex items-center justify-between p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl">
            <button
              onClick={() => onOpenContribute(goal.id, goal.name)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> Contribute Now
            </button>

            <div className="flex items-center gap-2">
              {goal.status === 'ACTIVE' && (
                <button
                  onClick={() => onStatusChange(goal.id, 'PAUSED')}
                  className="p-2 text-xs font-medium text-[#78716C] hover:text-[#B88728] hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Pause Goal"
                >
                  <PauseCircle className="w-4 h-4" /> Pause
                </button>
              )}
              {goal.status === 'PAUSED' && (
                <button
                  onClick={() => onStatusChange(goal.id, 'ACTIVE')}
                  className="p-2 text-xs font-medium text-[#78716C] hover:text-emerald-700 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  Resume
                </button>
              )}
              {goal.status !== 'COMPLETED' && (
                <button
                  onClick={() => onStatusChange(goal.id, 'COMPLETED')}
                  className="p-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Complete
                </button>
              )}
              {goal.status !== 'ARCHIVED' && (
                <button
                  onClick={() => onStatusChange(goal.id, 'ARCHIVED')}
                  className="p-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200 rounded-lg transition-colors"
                  title="Archive Goal"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('Delete this goal and all associated contribution records?')) {
                    onDelete(goal.id);
                  }
                }}
                className="p-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtabs Rail */}
          <div className="border-b border-[#E7E5E4] flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('TRAJECTORY')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'TRAJECTORY' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Planned Trajectory
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'HISTORY' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Contributions Ledger ({history.length})
            </button>
            <button
              onClick={() => setActiveTab('MILESTONES')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'MILESTONES' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Milestones ({milestones.filter((m) => m.isAchieved).length}/{milestones.length})
            </button>
          </div>

          {/* TAB: TRAJECTORY */}
          {activeTab === 'TRAJECTORY' && (
            <div className="space-y-4">
              <div className="border border-[#E7E5E4] rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9] text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
                      <th className="p-3">Timeline Date</th>
                      <th className="p-3 text-right">Planned Target</th>
                      <th className="p-3 text-right">Actual Saved</th>
                      <th className="p-3 text-right">Pace Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4] text-xs">
                    {trajectory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-[#78716C]">No trajectory sample points mapped yet.</td>
                      </tr>
                    ) : (
                      trajectory.map((point, i) => (
                        <tr key={i} className="hover:bg-[#FAFAF9] transition-colors">
                          <td className="p-3 text-[#1C1917] font-medium">{point.date}</td>
                          <td className="p-3 text-right tabular-nums text-[#78716C]"><Money amount={point.plannedAmount} /></td>
                          <td className="p-3 text-right tabular-nums font-semibold text-[#1C1917]"><Money amount={point.actualAmount} /></td>
                          <td className="p-3 text-right tabular-nums">
                            <span className={`font-semibold ${point.gapAmount <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {point.gapAmount <= 0 ? '+' : '-'}₹{Math.abs(point.gapAmount).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="p-6 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-center text-xs text-[#78716C]">
                  No contributions or withdrawals recorded yet.
                </div>
              ) : (
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9] text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Note / Source</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E5E4]">
                      {history.map((h) => (
                        <tr key={h.id} className="hover:bg-[#FAFAF9] transition-colors">
                          <td className="p-3 text-[#78716C]">{h.date}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              h.type === 'CONTRIBUTION' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}>
                              {h.type}
                            </span>
                          </td>
                          <td className="p-3 text-[#1C1917]">{h.note || h.sourceType}</td>
                          <td className="p-3 text-right font-semibold tabular-nums text-[#1C1917]">
                            <Money amount={h.amount} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: MILESTONES */}
          {activeTab === 'MILESTONES' && (
            <div className="space-y-4">
              <div className="border border-[#E7E5E4] rounded-xl overflow-hidden bg-white divide-y divide-[#E7E5E4]">
                {milestones.map((m) => (
                  <div key={m.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#FAFAF9] transition-colors">
                    <div className="flex items-center gap-3">
                      {m.isAchieved ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Square className="w-4 h-4 text-[#A8A29E]" />
                      )}
                      <div>
                        <h4 className={`font-semibold ${m.isAchieved ? 'text-emerald-700' : 'text-[#1C1917]'}`}>
                          {m.label} ({m.targetPct}%)
                        </h4>
                        {m.achievedAt && (
                          <span className="text-[10px] text-[#78716C]">Achieved on {m.achievedAt}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[#78716C] font-medium">
                      Target: <Money amount={(goal.adjustedFutureValue * m.targetPct) / 100} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
