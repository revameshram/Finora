import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Settings as SettingsIcon,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  PieChart as PieIcon,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

import { Money, InsightsCard, EmptyState, OnboardingDrawer } from '../shared';
import { GoalSettingsModal } from './GoalSettingsModal';
import { SingleContributeModal } from './SingleContributeModal';
import { BulkContributeModal } from './BulkContributeModal';
import { CreateGoalModal } from './CreateGoalModal';
import { GoalDetailModal } from './GoalDetailModal';

export const GoalManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'ACHIEVEMENTS' | 'HISTORY'>('OVERVIEW');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Backend state
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<any>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSingleContributeOpen, setIsSingleContributeOpen] = useState(false);
  const [isBulkContributeOpen, setIsBulkContributeOpen] = useState(false);
  const [selectedGoalForContribute, setSelectedGoalForContribute] = useState<{ id: string; name: string } | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/goals/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      } else {
        // Fallback default fixture if mock server / auth varies
        seedDefaultState();
      }
    } catch (e) {
      seedDefaultState();
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultState = () => {
    setDashboard({
      totalSavedAmount: 810000,
      totalTargetAmount: 13450000,
      totalAdjustedFutureValue: 14850000,
      overallProgressPercentage: 5.45,
      activeGoalsCount: 4,
      onTrackCount: 3,
      behindCount: 1,
      totalRequiredMonthlyContribution: 48500,
      monthlySavingsCapacity: 50000,
      isOverCapacity: false,
      capacityOverageAmount: 0,
      nextDueGoalName: '6-Month Emergency Shield',
      nextDueDays: 300,
      goals: [
        {
          id: 'g-1',
          name: '6-Month Emergency Shield',
          category: 'EMERGENCY_FUND',
          priority: 'HIGH',
          targetAmount: 600000,
          adjustedFutureValue: 600000,
          targetDate: '2027-09-01',
          daysRemaining: 360,
          currentValue: 350000,
          progressPercentage: 58.3,
          requiredMonthlyContribution: 20833,
          status: 'ACTIVE',
        },
        {
          id: 'g-2',
          name: 'Tokyo & Kyoto Cherry Blossom Trip',
          category: 'VACATION',
          priority: 'MEDIUM',
          targetAmount: 350000,
          adjustedFutureValue: 388000,
          targetDate: '2028-03-01',
          daysRemaining: 540,
          currentValue: 85000,
          progressPercentage: 21.9,
          requiredMonthlyContribution: 16833,
          status: 'BEHIND',
        },
        {
          id: 'g-3',
          name: 'Whitefield Apartment Down Payment',
          category: 'HOME_DOWNPAYMENT',
          priority: 'HIGH',
          targetAmount: 2500000,
          adjustedFutureValue: 2980000,
          targetDate: '2029-09-01',
          daysRemaining: 1080,
          currentValue: 435000,
          progressPercentage: 14.6,
          requiredMonthlyContribution: 70690,
          status: 'ACTIVE',
        },
      ],
      allocationByCategory: {
        'Emergency Fund': 350000,
        'Vacation & Travel': 85000,
        'Home Down Payment': 435000,
      },
      nudges: [
        {
          id: 'n-1',
          goalId: 'g-2',
          goalName: 'Tokyo & Kyoto Cherry Blossom Trip',
          type: 'BEHIND_PACE',
          severity: 'WARNING',
          title: 'Tokyo Trip is Lagging Behind Pace',
          message: 'Requires ₹16,833/mo to stay on schedule for Spring 2028.',
          actionLabel: 'Contribute Now',
        },
      ],
    });
  };

  const handleSeedSampleData = async () => {
    try {
      await fetch('/api/v1/goals/seed', { method: 'POST' });
      fetchDashboard();
    } catch (e) {
      fetchDashboard();
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    try {
      await fetch('/api/v1/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSingleContribute = async (contrib: any) => {
    try {
      await fetch(`/api/v1/goals/${contrib.goalId}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contrib),
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkContribute = async (payload: any) => {
    try {
      await fetch('/api/v1/goals/bulk-contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (settings: any) => {
    try {
      await fetch('/api/v1/goals/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenGoalDetail = async (goalId: string) => {
    try {
      const res = await fetch(`/api/v1/goals/${goalId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedGoalDetail(data);
      }
    } catch (e) {
      const found = dashboard?.goals.find((g: any) => g.id === goalId);
      if (found) {
        setSelectedGoalDetail({
          goal: found,
          history: [],
          milestones: [
            { id: 'm1', label: '25% Milestone', targetPct: 25, isAchieved: found.progressPercentage >= 25 },
            { id: 'm2', label: '50% Halfway', targetPct: 50, isAchieved: found.progressPercentage >= 50 },
            { id: 'm3', label: '75% Final Stretch', targetPct: 75, isAchieved: found.progressPercentage >= 75 },
            { id: 'm4', label: '100% Target', targetPct: 100, isAchieved: found.progressPercentage >= 100 },
          ],
          trajectory: [],
          linkedPortfolioAssetIds: [],
        });
      }
    }
  };

  const handleStatusChange = async (goalId: string, status: string) => {
    try {
      await fetch(`/api/v1/goals/${goalId}/status?status=${status}`, { method: 'PATCH' });
      setSelectedGoalDetail(null);
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await fetch(`/api/v1/goals/${goalId}`, { method: 'DELETE' });
      setSelectedGoalDetail(null);
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B88728]" />
      </div>
    );
  }

  const goals = dashboard.goals || [];
  const filteredGoals = goals.filter((g: any) => {
    if (statusFilter === 'ALL') return g.status !== 'ARCHIVED';
    return g.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[#F3F6F3]">Goal Manager</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B88728]/20 border border-[#B88728]/40 text-[#B88728]">
              Track A
            </span>
          </div>
          <p className="text-xs text-[#8DA698] mt-1">
            Pace monitoring against monthly savings capacity, inflation-adjusted target costing & Portfolio links.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSeedSampleData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#8DA698] hover:text-[#F3F6F3] border border-[#2D4A3E] hover:bg-[#12241C] rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B88728]" /> Try Sample Data
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-xs font-medium text-[#8DA698] hover:text-[#F3F6F3] border border-[#2D4A3E] hover:bg-[#12241C] rounded-lg transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsBulkContributeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#F3F6F3] bg-[#12241C] border border-[#2D4A3E] hover:border-[#B88728] rounded-lg transition-colors"
          >
            <Layers className="w-4 h-4 text-[#B88728]" /> Bulk Contribute
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0E1B15] bg-[#B88728] hover:bg-[#d49d32] rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Goal
          </button>
        </div>
      </div>

      {/* Header KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#8DA698]">Total Saved (Current Value)</span>
          <p className="text-2xl font-bold font-serif text-[#F3F6F3] mt-1">
            <Money amount={dashboard.totalSavedAmount} />
          </p>
          <div className="flex items-center justify-between text-xs text-[#8DA698] mt-2">
            <span>Adj Target: <Money amount={dashboard.totalAdjustedFutureValue} /></span>
            <span className="font-semibold text-[#B88728]">{dashboard.overallProgressPercentage}%</span>
          </div>
        </div>

        <div className="p-5 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#8DA698]">Goal Health & Status</span>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#1B6B44]">
              <CheckCircle className="w-4 h-4" /> {dashboard.onTrackCount} On Track
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#A83A2E]">
              <AlertTriangle className="w-4 h-4" /> {dashboard.behindCount} Behind
            </div>
          </div>
          <p className="text-xs text-[#8DA698] mt-2">{dashboard.activeGoalsCount} total active goals monitored</p>
        </div>

        <div className="p-5 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#8DA698]">Required Monthly Savings</span>
          <p className="text-2xl font-bold font-serif text-[#1B6B44] mt-1">
            <Money amount={dashboard.totalRequiredMonthlyContribution} /><span className="text-xs font-normal text-[#8DA698]">/mo</span>
          </p>

          <p className="text-xs text-[#8DA698] mt-2">
            Capacity Ceiling: <Money amount={dashboard.monthlySavingsCapacity} />/mo
          </p>
        </div>

        <div className="p-5 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#8DA698]">Next Milestone Due</span>
          <p className="text-base font-semibold text-[#F3F6F3] mt-1 truncate">
            {dashboard.nextDueGoalName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#B88728] mt-2">
            <Clock className="w-3.5 h-3.5" /> Due in {dashboard.nextDueDays} days
          </div>
        </div>
      </div>

      {/* Capacity Bar & Over-Capacity Banner */}
      <div className="p-5 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1B6B44]" />
            <span className="font-semibold text-[#F3F6F3]">Monthly Savings Capacity Bar</span>
          </div>
          <div className="text-[#8DA698]">
            <span className={dashboard.isOverCapacity ? 'text-[#A83A2E] font-bold' : 'text-[#1B6B44] font-bold'}>
              <Money amount={dashboard.totalRequiredMonthlyContribution} />
            </span>{' '}
            / <Money amount={dashboard.monthlySavingsCapacity} />/mo capacity
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-[#12241C] border border-[#2D4A3E] rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              dashboard.isOverCapacity ? 'bg-[#A83A2E]' : 'bg-[#1B6B44]'
            }`}
            style={{
              width: `${Math.min(100, (dashboard.totalRequiredMonthlyContribution / dashboard.monthlySavingsCapacity) * 100)}%`,
            }}
          />
        </div>

        {dashboard.isOverCapacity && (
          <div className="p-3 bg-[#A83A2E]/10 border border-[#A83A2E]/30 rounded-lg flex items-center justify-between text-xs text-[#A83A2E]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Over capacity by <strong>₹{dashboard.capacityOverageAmount.toLocaleString()}/mo</strong>. Adjust your target dates or increase capacity ceiling.
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1 bg-[#A83A2E] text-[#F3F6F3] rounded font-semibold text-[11px] hover:bg-[#c74537]"
            >
              Fix in Settings
            </button>
          </div>
        )}
      </div>

      {/* Nudges Feed */}
      {dashboard.nudges && dashboard.nudges.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8DA698]">Actionable Goal Nudges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboard.nudges.map((nudge: any) => (
              <div
                key={nudge.id}
                onClick={() => {
                  if (nudge.goalId) handleOpenGoalDetail(nudge.goalId);
                  else if (nudge.type === 'CAPACITY_OVERAGE') setIsSettingsOpen(true);
                }}
                className="p-4 bg-[#0E1B15] border border-[#2D4A3E] hover:border-[#B88728] rounded-xl cursor-pointer transition-all flex items-start justify-between gap-4 group"
              >
                <div>
                  <h4 className="text-xs font-semibold text-[#F3F6F3] group-hover:text-[#B88728] transition-colors">
                    {nudge.title}
                  </h4>
                  <p className="text-xs text-[#8DA698] mt-1">{nudge.message}</p>
                </div>
                <button className="px-2.5 py-1 text-[11px] font-semibold text-[#B88728] border border-[#B88728]/40 rounded hover:bg-[#B88728]/10 transition-colors shrink-0">
                  {nudge.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E382B] pb-3">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'OVERVIEW' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            Goal Cards ({goals.length})
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'TIMELINE' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            Timeline View
          </button>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8DA698]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#12241C] border border-[#2D4A3E] text-xs text-[#F3F6F3] px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#B88728]"
          >
            <option value="ALL">All Active Goals</option>
            <option value="ACTIVE">On Track Only</option>
            <option value="BEHIND">Behind Pace Only</option>
            <option value="COMPLETED">Completed Goals</option>
          </select>
        </div>
      </div>

      {/* OVERVIEW TAB: Per-Goal Summary Cards Grid */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((g: any) => (
            <div
              key={g.id}
              className="p-5 bg-[#0E1B15] border border-[#2D4A3E] hover:border-[#B88728] rounded-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8DA698] bg-[#12241C] px-2 py-0.5 rounded border border-[#1E382B]">
                    {g.category.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    g.status === 'BEHIND' ? 'bg-[#A83A2E]/20 border-[#A83A2E]/40 text-[#A83A2E]' : 'bg-[#1B6B44]/20 border-[#1B6B44]/40 text-[#1B6B44]'
                  }`}>
                    {g.status}
                  </span>
                </div>

                <h3
                  onClick={() => handleOpenGoalDetail(g.id)}
                  className="text-base font-bold text-[#F3F6F3] hover:text-[#B88728] cursor-pointer transition-colors"
                >
                  {g.name}
                </h3>

                <div className="flex items-center justify-between text-xs text-[#8DA698] mt-3">
                  <span>Saved: <span className="font-semibold text-[#F3F6F3]"><Money amount={g.currentValue} /></span></span>
                  <span>Target: <Money amount={g.adjustedFutureValue} /></span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#12241C] border border-[#2D4A3E] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#1B6B44] to-[#B88728] rounded-full"
                    style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E382B] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#8DA698] uppercase">Req. SIP</span>
                  <p className="font-semibold text-[#1B6B44]"><Money amount={g.requiredMonthlyContribution} />/mo</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedGoalForContribute({ id: g.id, name: g.name });
                      setIsSingleContributeOpen(true);
                    }}
                    className="p-1.5 text-xs text-[#B88728] border border-[#B88728]/30 rounded hover:bg-[#B88728]/10 transition-colors flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> +Contribute
                  </button>
                  <button
                    onClick={() => handleOpenGoalDetail(g.id)}
                    className="p-1.5 text-[#8DA698] hover:text-[#F3F6F3] rounded hover:bg-[#12241C]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TIMELINE TAB: Gantt-style Timeline Bars */}
      {activeTab === 'TIMELINE' && (
        <div className="p-6 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl space-y-6">
          <div className="flex items-center justify-between text-xs text-[#8DA698] border-b border-[#1E382B] pb-3">
            <span>Goal Timeline Progress</span>
            <span>Target Horizon Marker</span>
          </div>

          <div className="space-y-6">
            {goals.map((g: any) => (
              <div key={g.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#F3F6F3]">{g.name}</span>
                  <span className="text-[#8DA698]">Target Date: {g.targetDate} ({g.daysRemaining} days remaining)</span>
                </div>
                <div className="relative w-full h-4 bg-[#12241C] border border-[#2D4A3E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1B6B44] rounded-full"
                    style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                  />
                  {/* Today marker */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-[#B88728] left-[35%]" title="Today" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <GoalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        monthlySavingsCapacity={dashboard.monthlySavingsCapacity}
        behindScheduleThresholdPct={10}
        defaultInflationRatePct={6.0}
        onSave={handleSaveSettings}
      />

      <CreateGoalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateGoal}
      />

      <SingleContributeModal
        isOpen={isSingleContributeOpen}
        onClose={() => setIsSingleContributeOpen(false)}
        goalId={selectedGoalForContribute?.id || ''}
        goalName={selectedGoalForContribute?.name || ''}
        onSave={handleSingleContribute}
      />

      <BulkContributeModal
        isOpen={isBulkContributeOpen}
        onClose={() => setIsBulkContributeOpen(false)}
        goals={goals}
        onSave={handleBulkContribute}
      />

      <GoalDetailModal
        isOpen={selectedGoalDetail !== null}
        onClose={() => setSelectedGoalDetail(null)}
        data={selectedGoalDetail}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteGoal}
        onOpenContribute={(id, name) => {
          setSelectedGoalDetail(null);
          setSelectedGoalForContribute({ id, name });
          setIsSingleContributeOpen(true);
        }}
      />
    </div>
  );
};
