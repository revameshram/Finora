import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Building,
  Target,
  Flame,
  CreditCard,
  Compass,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  PieChart as PieIcon,
  HelpCircle,
} from 'lucide-react';
import { insightsApi, type SuiteInsights } from '../../services/insightsApi';

interface SuiteInsightsViewProps {
  onNavigateToModule: (moduleId: string) => void;
}

const formatModuleName = (mod: string): string => {
  if (!mod) return 'Finora Suite';
  switch (mod.toUpperCase()) {
    case 'EXPENSE':
    case 'EXPENSE_TRACKER':
    case 'EXPENSE-TRACKER':
      return 'Expense Tracker';
    case 'NET_WORTH':
    case 'NET_WORTH_TRACKER':
    case 'NET-WORTH-TRACKER':
      return 'Net Worth Tracker';
    case 'PORTFOLIO':
    case 'PORTFOLIO_TRACKER':
    case 'PORTFOLIO-TRACKER':
      return 'Portfolio Tracker';
    case 'GOAL':
    case 'GOAL_MANAGER':
    case 'GOAL-MANAGER':
      return 'Goal Manager';
    case 'FIRE':
    case 'FIRE_PLANNER':
    case 'FIRE-PLANNER':
      return 'FIRE Planner';
    case 'EMI':
    case 'EMI_MANAGER':
    case 'EMI-MANAGER':
      return 'EMI Manager';
    case 'TRIP':
    case 'TRIP_MANAGER':
    case 'TRIP-MANAGER':
      return 'Trip Manager';
    case 'VAULT':
      return 'Vault';
    default:
      return mod.replace(/_/g, ' ');
  }
};

const resolveModuleRoute = (mod?: string): string => {
  if (!mod) return 'workspace';
  const m = mod.toLowerCase().replace(/_/g, '-');
  if (m.includes('expense')) return 'expense-tracker';
  if (m.includes('net-worth') || m.includes('networth')) return 'net-worth-tracker';
  if (m.includes('portfolio')) return 'portfolio-tracker';
  if (m.includes('goal')) return 'goal-manager';
  if (m.includes('fire')) return 'fire-planner';
  if (m.includes('emi')) return 'emi-manager';
  if (m.includes('trip')) return 'trip-manager';
  if (m.includes('vault')) return 'vault';
  if (m.includes('learn')) return 'learn';
  return 'workspace';
};

export const SuiteInsightsView: React.FC<SuiteInsightsViewProps> = ({ onNavigateToModule }) => {
  const [data, setData] = useState<SuiteInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLifeArea, setSelectedLifeArea] = useState<string>('ALL');

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await insightsApi.getSuiteInsights();
      setData(result);
    } catch (err: any) {
      console.error('Failed to load suite insights:', err);
      setError('Unable to fetch live suite insights. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getTierBadge = (tierStr?: string) => {
    const tier = (tierStr || '').toUpperCase();
    if (tier.includes('EXCELLENT') || tier.includes('FLOURISHING')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: tierStr || 'Flourishing Health',
        icon: CheckCircle2,
      };
    }
    if (tier.includes('GOOD') || tier.includes('STRONG')) {
      return {
        bg: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
        label: tierStr || 'Strong Standing',
        icon: CheckCircle2,
      };
    }
    if (tier.includes('FAIR') || tier.includes('MODERATE')) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        label: tierStr || 'Moderate Standing',
        icon: AlertTriangle,
      };
    }
    if (tier.includes('ATTENTION') || tier.includes('CRITICAL')) {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        label: tierStr || 'Needs Attention',
        icon: ShieldAlert,
      };
    }
    return {
      bg: 'bg-stone-100 text-stone-700 border-stone-200',
      label: tierStr || 'Healthy',
      icon: HelpCircle,
    };
  };

  const getIndicatorBadge = (indicator?: string) => {
    const ind = (indicator || '').toUpperCase();
    if (ind.includes('POSITIVE')) {
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
    if (ind.includes('WARNING') || ind.includes('OPPORTUNITY')) {
      return 'text-amber-700 bg-amber-50 border-amber-200';
    }
    if (ind.includes('CRITICAL') || ind.includes('NEGATIVE')) {
      return 'text-rose-700 bg-rose-50 border-rose-200';
    }
    return 'text-stone-700 bg-stone-100 border-stone-200';
  };

  const getModuleIcon = (route: string) => {
    if (route.includes('expense')) return Wallet;
    if (route.includes('net-worth')) return Building;
    if (route.includes('portfolio')) return TrendingUp;
    if (route.includes('goal')) return Target;
    if (route.includes('fire')) return Flame;
    if (route.includes('emi')) return CreditCard;
    if (route.includes('trip')) return Compass;
    if (route.includes('vault')) return ShieldCheck;
    return Activity;
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E7E5E4] text-center space-y-4">
        <RefreshCw className="h-8 w-8 text-[#B88728] animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#1C1917]">
          Aggregating Cross-Module Analytics & Insights...
        </p>
        <p className="text-xs text-[#78716C]">
          Reconciling Cash Flow, Net Worth Balance Sheet, Portfolio Valuations, and Goal Timelines.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white p-8 rounded-xl border border-rose-200 text-center space-y-4">
        <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
        <p className="text-sm font-semibold text-rose-800">{error || 'No insights available.'}</p>
        <button
          type="button"
          onClick={fetchInsights}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Sync</span>
        </button>
      </div>
    );
  }

  const { healthScore, keyMetrics, recommendations, executiveSummary, assetAllocationDistribution } = data;
  const tier = getTierBadge(healthScore.statusTier);
  const TierIcon = tier.icon;
  const retirementScore = healthScore.retirementReadinessScore ?? healthScore.retirementFreedomScore ?? 80;
  const scoreSummary = healthScore.summary || healthScore.primaryRecommendation || 'Overall financial position is strong and diversified.';

  const lifeAreas = [
    { key: 'ALL', label: 'All Life Areas' },
    { key: 'CASH_FLOW', label: 'Cash Flow' },
    { key: 'DEBT', label: 'Debt & Loans' },
    { key: 'WEALTH', label: 'Wealth & Investments' },
    { key: 'LIFE_ADMIN', label: 'Life Admin' },
  ];

  const filteredMetrics =
    selectedLifeArea === 'ALL'
      ? keyMetrics
      : keyMetrics.filter((m) => m.lifeArea === selectedLifeArea);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E7E5E4]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">
                Holistic Financial Diagnostic
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/20">
                Live Cross-Module Sync
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1C1917]">
              Suite-Wide Insights & Health Engine
            </h2>
            <p className="text-xs text-[#78716C] max-w-3xl">
              Unified diagnostic synthesizing operational data across all 8 modules — Cash Flow velocity, Balance Sheet solvency, Goal trajectories, and FIRE readiness.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchInsights}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1C1917] bg-[#FAFAF9] hover:bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#78716C]" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Nudge */}
        <div className="p-4 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[#B88728] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Executive Synthesis</h3>
            <p className="text-xs text-[#44403C] leading-relaxed">{executiveSummary || scoreSummary}</p>
          </div>
        </div>
      </div>

      {/* 1. Composite Financial Health Score (0-100 Gauge & 4 Pillars) */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-serif font-bold text-[#1C1917]">
              Composite Financial Health Score
            </h3>
            <p className="text-xs text-[#78716C]">
              Weighted across Cash Flow (30%), Solvency (30%), Goal Pacing (20%), and Retirement Freedom (20%).
            </p>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${tier.bg}`}>
            <TierIcon className="h-4 w-4" />
            <span>{tier.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Dial / Score Block */}
          <div className="lg:col-span-4 p-6 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] text-center space-y-2">
            <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
              Overall Health Index
            </span>
            <div className="text-5xl font-extrabold text-[#1C1917] font-serif tabular-nums">
              {Math.round(healthScore.overallScore)}
              <span className="text-xl text-[#78716C] font-sans font-normal"> / 100</span>
            </div>
            <p className="text-xs font-medium text-[#B45309]">{scoreSummary}</p>
          </div>

          {/* 4 Pillar Breakdown Bars */}
          <div className="lg:col-span-8 space-y-3.5">
            {/* Pillar 1: Cash Flow (30%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1C1917] flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-[#B45309]" />
                  Cash Flow Cushion (30% weight)
                </span>
                <span className="text-[#78716C] tabular-nums">
                  {Math.round(healthScore.cashFlowScore)}/100 · {healthScore.cashFlowStatus || (healthScore.cashFlowScore >= 75 ? 'Optimal Retention' : 'Moderate')}
                </span>
              </div>
              <div className="w-full bg-[#E7E5E4] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#B88728] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, healthScore.cashFlowScore))}%` }}
                />
              </div>
            </div>

            {/* Pillar 2: Solvency (30%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1C1917] flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-[#B45309]" />
                  Solvency & Balance Sheet (30% weight)
                </span>
                <span className="text-[#78716C] tabular-nums">
                  {Math.round(healthScore.solvencyScore)}/100 · {healthScore.solvencyStatus || (healthScore.solvencyScore >= 75 ? 'Low Leverage' : 'Moderate')}
                </span>
              </div>
              <div className="w-full bg-[#E7E5E4] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#B88728] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, healthScore.solvencyScore))}%` }}
                />
              </div>
            </div>

            {/* Pillar 3: Goal Pacing (20%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1C1917] flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-[#B45309]" />
                  Goal Pacing (20% weight)
                </span>
                <span className="text-[#78716C] tabular-nums">
                  {Math.round(healthScore.goalPacingScore)}/100 · {healthScore.goalPacingStatus || (healthScore.goalPacingScore >= 75 ? 'On Schedule' : 'Moderate')}
                </span>
              </div>
              <div className="w-full bg-[#E7E5E4] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#B88728] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, healthScore.goalPacingScore))}%` }}
                />
              </div>
            </div>

            {/* Pillar 4: Retirement Freedom (20%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1C1917] flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-[#B45309]" />
                  Retirement & FIRE Freedom (20% weight)
                </span>
                <span className="text-[#78716C] tabular-nums">
                  {Math.round(retirementScore)}/100 · {healthScore.retirementFreedomStatus || (retirementScore >= 75 ? 'Accelerated Runway' : 'Moderate')}
                </span>
              </div>
              <div className="w-full bg-[#E7E5E4] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#B88728] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, retirementScore))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cross-Module Key Metrics Grid Grouped by Life-Area */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-serif font-bold text-[#1C1917]">
              Cross-Module Key Operational Metrics
            </h3>
            <p className="text-xs text-[#78716C]">
              Every metric originates from a specific operational engine, tagged with its source module.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {lifeAreas.map((area) => (
              <button
                key={area.key}
                type="button"
                onClick={() => setSelectedLifeArea(area.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                  selectedLifeArea === area.key
                    ? 'bg-[#B88728] text-white border-[#B88728]'
                    : 'bg-white text-[#78716C] border-[#E7E5E4] hover:text-[#1C1917]'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMetrics.map((item) => {
            const targetRoute = resolveModuleRoute(item.targetModuleRoute || item.sourceModuleId || item.sourceModule);
            const ModuleIcon = getModuleIcon(targetRoute);
            const indicatorCls = getIndicatorBadge(item.trend || item.healthIndicator);
            const displayVal = item.displayValue || item.value || '—';
            const subtext = item.subtext || item.changeDescription || '';
            const moduleName = formatModuleName(item.sourceModule);

            return (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-[#E7E5E4] shadow-xs flex flex-col justify-between space-y-3 hover:border-[#B88728] transition-all cursor-pointer group"
                onClick={() => onNavigateToModule(targetRoute)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${indicatorCls}`}>
                      {item.trend || item.healthIndicator || 'POSITIVE'}
                    </span>
                  </div>

                  <div className="text-xl font-bold text-[#1C1917] font-serif tabular-nums">
                    {displayVal}
                  </div>

                  {subtext && <p className="text-xs text-[#78716C] leading-snug">{subtext}</p>}
                </div>

                <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B45309]">
                    <ModuleIcon className="h-3.5 w-3.5" />
                    <span>{moduleName}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#78716C] group-hover:text-[#B88728] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Asset Allocation & Balance Sheet Composition */}
      {assetAllocationDistribution && Object.keys(assetAllocationDistribution).length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-[#B88728]" />
              <h3 className="text-base font-serif font-bold text-[#1C1917]">
                Asset Class Allocation Distribution
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToModule('portfolio-tracker')}
              className="text-xs font-semibold text-[#B88728] hover:text-[#a67520] inline-flex items-center gap-1"
            >
              <span>View in Portfolio Tracker</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(assetAllocationDistribution).map(([assetClass, pct]) => {
              const val = typeof pct === 'number' ? pct : parseFloat(String(pct) || '0');
              return (
                <div key={assetClass} className="p-3 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] space-y-1">
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block truncate">
                    {assetClass}
                  </span>
                  <span className="text-base font-bold text-[#1C1917] tabular-nums block">
                    {val.toFixed(1)}%
                  </span>
                  <div className="w-full bg-[#E7E5E4] rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      className="bg-[#B88728] h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Strategic Recommendations & Cross-Module Nudges */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <div>
            <h3 className="text-base font-serif font-bold text-[#1C1917]">
              Strategic Cross-Module Action Nudges
            </h3>
            <p className="text-xs text-[#78716C]">
              Context-aware recommendations driven by your live cash flow, debt interest rates, and goal timelines.
            </p>
          </div>
          <span className="text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-md border border-[#B45309]/20">
            {recommendations.length} Active Nudges
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.map((nudge) => {
            const urgencyVal = (nudge.severity || nudge.urgency || 'OPPORTUNITY').toUpperCase();
            const urgencyBadge =
              urgencyVal.includes('CRITICAL') || urgencyVal.includes('HIGH')
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : urgencyVal.includes('WARNING') || urgencyVal.includes('OPPORTUNITY')
                ? 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            const moduleName = formatModuleName(nudge.sourceModule);
            const targetRoute = resolveModuleRoute(nudge.actionRoute || nudge.targetModuleId || nudge.sourceModule);
            const actionText = nudge.actionLabel || nudge.actionText || 'Open Module';
            const message = nudge.message || nudge.description || '';

            return (
              <div
                key={nudge.id}
                className="p-4 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-[#B88728] transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${urgencyBadge}`}>
                      {urgencyVal}
                    </span>
                    <span className="text-[10px] font-bold text-[#78716C] bg-white px-2 py-0.5 rounded border border-[#E7E5E4]">
                      Source: {moduleName}
                    </span>
                    <h4 className="text-sm font-bold text-[#1C1917]">{nudge.title}</h4>
                  </div>
                  {message && <p className="text-xs text-[#44403C] leading-relaxed max-w-3xl">{message}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToModule(targetRoute)}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg shadow-xs transition-colors"
                >
                  <span>{actionText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
