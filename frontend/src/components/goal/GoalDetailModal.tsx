import React, { useState } from 'react';
import { X, Target, Calendar, TrendingUp, CheckCircle, Clock, AlertTriangle, PauseCircle, Archive, Trash2, PlusCircle, CheckSquare, Square } from 'lucide-react';
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

  const { goal, history, milestones, trajectory, linkedPortfolioAssetIds } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1B6B44]/20 border border-[#1B6B44]/40 text-[#1B6B44]">Completed 🎉</span>;
      case 'BEHIND':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#A83A2E]/20 border border-[#A83A2E]/40 text-[#A83A2E]">Behind Pace</span>;
      case 'PAUSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B88728]/20 border border-[#B88728]/40 text-[#B88728]">Paused</span>;
      case 'ARCHIVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#425A4E]/20 border border-[#425A4E]/40 text-[#8DA698]">Archived</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1B6B44]/20 border border-[#1B6B44]/40 text-[#1B6B44]">On Track</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0E1B15] text-[#F3F6F3] border border-[#2D4A3E] rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#1E382B] bg-[#12241C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B88728]/10 border border-[#B88728]/30 text-[#B88728]">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#F3F6F3]">{goal.name}</h2>
                {getStatusBadge(goal.status)}
              </div>
              <p className="text-xs text-[#8DA698] mt-0.5">
                Target Date: <span className="text-[#F3F6F3] font-medium">{goal.targetDate}</span> ({goal.daysRemaining} days left)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8DA698] hover:text-[#F3F6F3] hover:bg-[#1E382B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Target Value Banner: Today's Money -> Adj. FV */}
          <div className="p-4 bg-[#12241C] border border-[#2D4A3E] rounded-xl grid grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#8DA698]">Target (Today's Money)</span>
              <p className="text-lg font-bold text-[#F3F6F3] mt-0.5"><Money amount={goal.targetAmount} /></p>
            </div>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#8DA698]">Inflation-Adjusted Target</span>
              <p className="text-lg font-bold text-[#B88728] mt-0.5"><Money amount={goal.adjustedFutureValue} /></p>
              <span className="text-[10px] text-[#6B8576]">Compounded @ {goal.inflationRatePct}% inflation</span>
            </div>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#8DA698]">Required Monthly Rate</span>
              <p className="text-lg font-bold text-[#1B6B44] mt-0.5"><Money amount={goal.requiredMonthlyContribution} /><span className="text-xs font-normal text-[#8DA698]">/mo</span></p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#8DA698] font-medium">Saved: <span className="text-[#F3F6F3] font-bold"><Money amount={goal.currentValue} /></span></span>
              <span className="text-[#B88728] font-bold">{goal.progressPercentage}% Complete</span>
            </div>
            <div className="w-full h-3 bg-[#12241C] border border-[#2D4A3E] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#1B6B44] via-[#B88728] to-[#1B6B44] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
              />
            </div>
          </div>

          {/* Actions & Manage Toolbar */}
          <div className="flex items-center justify-between p-3 bg-[#12241C] border border-[#1E382B] rounded-lg">
            <button
              onClick={() => onOpenContribute(goal.id, goal.name)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0E1B15] bg-[#B88728] hover:bg-[#d49d32] rounded-lg transition-colors shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Contribute Now
            </button>

            <div className="flex items-center gap-2">
              {goal.status === 'ACTIVE' && (
                <button
                  onClick={() => onStatusChange(goal.id, 'PAUSED')}
                  className="p-2 text-xs font-medium text-[#8DA698] hover:text-[#B88728] hover:bg-[#1E382B] rounded-lg transition-colors flex items-center gap-1.5"
                  title="Pause Goal"
                >
                  <PauseCircle className="w-4 h-4" /> Pause
                </button>
              )}
              {goal.status === 'PAUSED' && (
                <button
                  onClick={() => onStatusChange(goal.id, 'ACTIVE')}
                  className="p-2 text-xs font-medium text-[#8DA698] hover:text-[#1B6B44] hover:bg-[#1E382B] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  Resume
                </button>
              )}
              {goal.status !== 'COMPLETED' && (
                <button
                  onClick={() => onStatusChange(goal.id, 'COMPLETED')}
                  className="p-2 text-xs font-medium text-[#1B6B44] hover:bg-[#1E382B] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Complete
                </button>
              )}
              <button
                onClick={() => onStatusChange(goal.id, 'ARCHIVED')}
                className="p-2 text-xs font-medium text-[#8DA698] hover:text-[#F3F6F3] hover:bg-[#1E382B] rounded-lg transition-colors"
                title="Archive Goal"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(goal.id)}
                className="p-2 text-xs font-medium text-[#A83A2E] hover:bg-[#A83A2E]/10 rounded-lg transition-colors"
                title="Delete Goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs Rail */}
          <div className="border-b border-[#1E382B] flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('TRAJECTORY')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'TRAJECTORY' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
              }`}
            >
              Actual vs Planned Trajectory
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'HISTORY' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
              }`}
            >
              Contribution History ({history.length})
            </button>
            <button
              onClick={() => setActiveTab('MILESTONES')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'MILESTONES' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
              }`}
            >
              Milestones & Checkpoints ({milestones.length})
            </button>
          </div>

          {/* TAB 1: TRAJECTORY */}
          {activeTab === 'TRAJECTORY' && (
            <div className="space-y-4">
              <div className="border border-[#1E382B] rounded-lg overflow-hidden bg-[#12241C]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E382B] bg-[#0E1B15] text-[11px] font-semibold text-[#8DA698] uppercase tracking-wider">
                      <th className="p-3">Timeline Date</th>
                      <th className="p-3 text-right">Planned Target</th>
                      <th className="p-3 text-right">Actual Saved</th>
                      <th className="p-3 text-right">Trajectory Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E382B] text-xs">
                    {trajectory.map((pt, idx) => {
                      const isAhead = pt.gapAmount >= 0;
                      return (
                        <tr key={idx} className="hover:bg-[#1A3327]">
                          <td className="p-3 font-medium text-[#F3F6F3]">{pt.date}</td>
                          <td className="p-3 text-right text-[#8DA698]"><Money amount={pt.plannedAmount} /></td>
                          <td className="p-3 text-right font-semibold text-[#F3F6F3]"><Money amount={pt.actualAmount} /></td>
                          <td className={`p-3 text-right font-semibold ${isAhead ? 'text-[#1B6B44]' : 'text-[#A83A2E]'}`}>
                            {isAhead ? '+' : ''}<Money amount={pt.gapAmount} /> ({pt.gapPercentage}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="p-6 bg-[#12241C] border border-[#1E382B] rounded-lg text-center text-xs text-[#8DA698]">
                  No contributions recorded yet. Use "+ Contribute Now" to add funds.
                </div>
              ) : (
                <div className="border border-[#1E382B] rounded-lg overflow-hidden bg-[#12241C]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#1E382B] bg-[#0E1B15] text-[11px] font-semibold text-[#8DA698] uppercase tracking-wider">
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3">Note / Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E382B]">
                      {history.map((c) => (
                        <tr key={c.id} className="hover:bg-[#1A3327]">
                          <td className="p-3 font-medium text-[#F3F6F3]">{c.date}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              c.type === 'CONTRIBUTION' ? 'bg-[#1B6B44]/20 text-[#1B6B44]' : 'bg-[#A83A2E]/20 text-[#A83A2E]'
                            }`}>
                              {c.type}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-[#F3F6F3]">
                            {c.type === 'CONTRIBUTION' ? '+' : '-'}<Money amount={c.amount} />
                          </td>
                          <td className="p-3 text-[#8DA698]">{c.note || c.sourceType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MILESTONES */}
          {activeTab === 'MILESTONES' && (
            <div className="space-y-3">
              <div className="border border-[#1E382B] rounded-lg overflow-hidden bg-[#12241C] divide-y divide-[#1E382B]">
                {milestones.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {m.isAchieved ? (
                        <CheckSquare className="w-5 h-5 text-[#1B6B44]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#6B8576]" />
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-[#F3F6F3]">{m.label}</h4>
                        <p className="text-[11px] text-[#8DA698]">Target: {m.targetPct}% of goal</p>
                      </div>
                    </div>
                    {m.isAchieved && (
                      <span className="text-xs font-medium text-[#1B6B44] bg-[#1B6B44]/10 px-2.5 py-1 rounded-full">
                        Achieved 🎉
                      </span>
                    )}
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
