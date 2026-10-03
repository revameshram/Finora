import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Plus,
  Sparkles,
  Layers,
  PieChart as PieChartIcon,
  ShieldAlert,
  Calculator,
  Search,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import {
  PortfolioDashboardDto,
  StockHoldingDto,
  EtfHoldingDto,
  MutualFundHoldingDto,
  NpsHoldingDto,
  DepositDto,
  BondDto,
  MetalHoldingDto,
  RealEstateDto,
  OtherInstrumentDto,
  GrowthOutlookResponseDto,
  DrawdownCheckResponseDto,
  DepositScheduleEntryDto,
  BondScheduleEntryDto,
  AssetType,
} from '../../types/portfolio';
import { portfolioApi } from '../../services/portfolioApi';
import { Money, InsightsCard, EmptyState, OnboardingDrawer } from '../shared';
import { useToast } from '../shared/ToastContext';
import { AddHoldingModal } from './AddHoldingModal';
import { AddSharesModal } from './AddSharesModal';
import { ScheduleModal } from './ScheduleModal';

const PORTFOLIO_ONBOARDING_STEPS = [
  {
    stepNumber: 1,
    title: 'Multi-Asset Engine & Real-Time Valuations',
    description:
      'Tracks 9 distinct asset classes: Stocks (NSE/BSE/US), ETFs, AMFI Mutual Funds, NPS Tier-1, FDs/RDs, Bonds, Gold/Metals, Real Estate, and Alternatives with live market quotes.',
    tip: 'Prices refresh automatically with Caffeine in-memory caching or can be updated on demand via "Refresh Prices".',
  },
  {
    stepNumber: 2,
    title: 'Add Shares & Recalculate Weighted-Average Cost Basis',
    description:
      'When acquiring additional shares of existing equities or ETFs, Finora automatically recalculates the blended weighted-average purchase cost.',
    tip: 'Use the "+ Add Shares" action on any holding in the ledger to compute new blended averages.',
  },
  {
    stepNumber: 3,
    title: 'Stress Testing & Growth Outlook Projections',
    description:
      'Simulate market crash drawdowns on equity buckets to determine recovery timelines, or model 1Y/3Y/5Y/10Y nominal and inflation-adjusted compound growth with monthly SIP inflows.',
  },
];

const PORTFOLIO_TIPS = [
  { id: 'pf_tip_1', label: 'Use "Try with Sample Data" to explore all 9 multi-asset classes immediately', completed: false },
  { id: 'pf_tip_2', label: 'Verify your Equity Drawdown cushion to ensure adequate non-equity protection', completed: false },
  { id: 'pf_tip_3', label: 'Toggle Include/Exclude on holdings to test impact on Net Worth and Goal allocations', completed: false },
];

export const PortfolioTracker: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'holdings' | 'growth' | 'drawdown'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Data state
  const [dashboard, setDashboard] = useState<PortfolioDashboardDto | null>(null);
  const [stocks, setStocks] = useState<StockHoldingDto[]>([]);
  const [etfs, setEtfs] = useState<EtfHoldingDto[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFundHoldingDto[]>([]);
  const [npsList, setNpsList] = useState<NpsHoldingDto[]>([]);
  const [deposits, setDeposits] = useState<DepositDto[]>([]);
  const [bonds, setBonds] = useState<BondDto[]>([]);
  const [metals, setMetals] = useState<MetalHoldingDto[]>([]);
  const [realEstateList, setRealEstateList] = useState<RealEstateDto[]>([]);
  const [otherInstruments, setOtherInstruments] = useState<OtherInstrumentDto[]>([]);

  // Modals state
  const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false);
  const [addSharesTarget, setAddSharesTarget] = useState<{
    id: string;
    ticker: string;
    companyName: string;
    quantity: number;
    avgCost: number;
    price: number;
    isEtf: boolean;
  } | null>(null);

  const [scheduleModalTarget, setScheduleModalTarget] = useState<{
    title: string;
    type: 'DEPOSIT' | 'BOND';
    depositSchedule?: DepositScheduleEntryDto[];
    bondSchedule?: BondScheduleEntryDto[];
  } | null>(null);

  // Holdings sub-tab filter & search
  const [holdingsFilter, setHoldingsFilter] = useState<'ALL' | AssetType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Growth Outlook Simulator State
  const [growthReturnPct, setGrowthReturnPct] = useState(12.0);
  const [growthYears, setGrowthYears] = useState(5);
  const [growthMonthlySip, setGrowthMonthlySip] = useState(25000);
  const [growthInflationPct, setGrowthInflationPct] = useState(6.0);
  const [growthResult, setGrowthResult] = useState<GrowthOutlookResponseDto | null>(null);

  // Drawdown Check Simulator State
  const [dropPct, setDropPct] = useState(30.0);
  const [recoveryReturnPct, setRecoveryReturnPct] = useState(15.0);
  const [drawdownResult, setDrawdownResult] = useState<DrawdownCheckResponseDto | null>(null);

  // Load all holdings & dashboard
  const loadPortfolioData = async () => {
    try {
      const [dash, st, et, mf, np, dep, bnd, met, re, oth] = await Promise.all([
        portfolioApi.getDashboard().catch(() => null),
        portfolioApi.listStocks().catch(() => []),
        portfolioApi.listEtfs().catch(() => []),
        portfolioApi.listMutualFunds().catch(() => []),
        portfolioApi.listNps().catch(() => []),
        portfolioApi.listDeposits().catch(() => []),
        portfolioApi.listBonds().catch(() => []),
        portfolioApi.listMetals().catch(() => []),
        portfolioApi.listRealEstate().catch(() => []),
        portfolioApi.listOtherInstruments().catch(() => []),
      ]);

      if (dash) setDashboard(dash);
      setStocks(st || []);
      setEtfs(et || []);
      setMutualFunds(mf || []);
      setNpsList(np || []);
      setDeposits(dep || []);
      setBonds(bnd || []);
      setMetals(met || []);
      setRealEstateList(re || []);
      setOtherInstruments(oth || []);
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
      toast.error('Failed to load portfolio holdings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  // Recalculate Growth Outlook when params change
  useEffect(() => {
    const calcGrowth = async () => {
      try {
        const res = await portfolioApi.calculateGrowthOutlook({
          expectedReturnPct: growthReturnPct,
          years: growthYears,
          monthlySavings: growthMonthlySip,
          inflationPct: growthInflationPct,
        });
        setGrowthResult(res);
      } catch (err) {
        console.error('Failed to calculate growth outlook:', err);
      }
    };
    calcGrowth();
  }, [growthReturnPct, growthYears, growthMonthlySip, growthInflationPct, dashboard?.presentValue]);

  // Recalculate Drawdown Check when params change
  useEffect(() => {
    const calcDrawdown = async () => {
      try {
        const res = await portfolioApi.calculateDrawdown({
          dropPct,
          recoveryReturnPct,
        });
        setDrawdownResult(res);
      } catch (err) {
        console.error('Failed to calculate drawdown:', err);
      }
    };
    calcDrawdown();
  }, [dropPct, recoveryReturnPct, dashboard?.presentValue]);

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    try {
      await portfolioApi.refreshPrices();
      toast.success('Live asset quotes refreshed successfully');
      await loadPortfolioData();
    } catch (err: any) {
      toast.error('Failed to refresh quotes: ' + (err?.message || 'Network error'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleSeedSampleData = async () => {
    setLoading(true);
    try {
      await portfolioApi.seedSampleData();
      toast.success('Realistic Indian sample portfolio seeded');
      await loadPortfolioData();
    } catch (err: any) {
      toast.error('Failed to seed sample data: ' + (err?.message || 'Error seeding data'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSchedule = async (type: 'DEPOSIT' | 'BOND', id: string, name: string) => {
    try {
      if (type === 'DEPOSIT') {
        const sched = await portfolioApi.getDepositSchedule(id);
        setScheduleModalTarget({
          title: `Deposit Schedule: ${name}`,
          type: 'DEPOSIT',
          depositSchedule: sched,
        });
      } else {
        const sched = await portfolioApi.getBondSchedule(id);
        setScheduleModalTarget({
          title: `Bond Coupon Schedule: ${name}`,
          type: 'BOND',
          bondSchedule: sched,
        });
      }
    } catch (err: any) {
      toast.error('Failed to fetch schedule: ' + (err?.message || 'Error'));
    }
  };

  const handleDeleteHolding = async (type: AssetType, id: string) => {
    if (!confirm('Are you sure you want to remove this asset holding?')) return;
    try {
      switch (type) {
        case 'STOCK':
          await portfolioApi.deleteStock(id);
          break;
        case 'ETF':
          await portfolioApi.deleteEtf(id);
          break;
        case 'MUTUAL_FUND':
          await portfolioApi.deleteMutualFund(id);
          break;
        case 'NPS':
          await portfolioApi.deleteNps(id);
          break;
        case 'DEPOSIT':
          await portfolioApi.deleteDeposit(id);
          break;
        case 'BOND':
          await portfolioApi.deleteBond(id);
          break;
        case 'METAL':
          await portfolioApi.deleteMetal(id);
          break;
        case 'REAL_ESTATE':
          await portfolioApi.deleteRealEstate(id);
          break;
        case 'OTHER':
          await portfolioApi.deleteOtherInstrument(id);
          break;
      }
      toast.success('Asset removed');
      await loadPortfolioData();
    } catch (err: any) {
      toast.error('Failed to remove asset: ' + (err?.message || 'Error'));
    }
  };

  const totalHoldingsCount =
    stocks.length +
    etfs.length +
    mutualFunds.length +
    npsList.length +
    deposits.length +
    bonds.length +
    metals.length +
    realEstateList.length +
    otherInstruments.length;

  const presentVal = dashboard?.presentValue ?? 0;
  const investedVal = dashboard?.totalInvested ?? 0;
  const totalGainLoss = dashboard?.overallGainLoss ?? dashboard?.gainLoss ?? (presentVal - investedVal);
  const totalGainLossPct =
    dashboard?.overallGainLossPct ??
    dashboard?.gainLossPct ??
    (investedVal > 0 ? (totalGainLoss / investedVal) * 100 : 0);
  const isGain = totalGainLoss >= 0;

  if (loading && !dashboard && totalHoldingsCount === 0) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-28 bg-stone-200/70 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-stone-200/60 rounded-xl" />
          <div className="h-24 bg-stone-200/60 rounded-xl" />
          <div className="h-24 bg-stone-200/60 rounded-xl" />
          <div className="h-24 bg-stone-200/60 rounded-xl" />
        </div>
        <div className="h-64 bg-stone-200/50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ------------------------------------------------------------- */}
      {/* HEADER BAR & SUMMARY METRICS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E7E5E4] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF2E8] text-[#C27D38] border border-[#C27D38]/30">
                Multi-Asset Engine
              </span>
              <span className="text-xs text-[#78716C]">Live Market Pricing & Allocation</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1C1917] mt-1">Portfolio Tracker</h1>
            <p className="text-xs text-[#78716C]">
              Institutional-grade multi-asset portfolio with live market pricing, Growth Outlook, and Equity Drawdown stress testing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
              title="Portfolio Guide & Architecture"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {totalHoldingsCount === 0 && (
              <button
                type="button"
                onClick={handleSeedSampleData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1C1917] bg-[#FAF2E8] hover:bg-[#F3E5D4] border border-[#C27D38]/40 rounded-xl transition-colors shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C27D38]" />
                <span>Try with Sample Data</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRefreshPrices}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1C1917] bg-white hover:bg-stone-50 border border-[#E7E5E4] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              title="Refresh live prices for stocks, ETFs, mutual funds, and bullion"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#78716C] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Prices'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddHoldingOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-xl shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-[#FEF3C7]" />
              <span>Add Holding</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-1">
            <span className="text-xs font-semibold text-[#78716C] block">Portfolio Present Value</span>
            <div className="text-xl font-serif font-bold text-[#1C1917] tabular-nums">
              <Money amount={presentVal} />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#78716C]">
              {dashboard?.oneDayChangeAmount ? (
                <span
                  className={
                    dashboard.oneDayChangeAmount >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'
                  }
                >
                  {dashboard.oneDayChangeAmount >= 0 ? '▲ +' : '▼ '}
                  <Money amount={Math.abs(dashboard.oneDayChangeAmount)} /> 1D
                </span>
              ) : (
                <span>Live aggregate market valuation</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-1">
            <span className="text-xs font-semibold text-[#78716C] block">Total Capital Invested</span>
            <div className="text-xl font-serif font-bold text-[#1C1917] tabular-nums">
              <Money amount={investedVal} />
            </div>
            <span className="text-[10px] text-[#78716C] block">Total cost basis</span>
          </div>

          <div className="p-4 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-1">
            <span className="text-xs font-semibold text-[#78716C] block">Unrealized Gain / Loss</span>
            <div
              className={`text-xl font-serif font-bold tabular-nums flex items-center gap-1 ${
                isGain ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isGain ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <Money amount={Math.abs(totalGainLoss)} />
            </div>
            <span
              className={`text-[10px] font-bold block ${
                isGain ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isGain ? '+' : '-'}
              {Math.abs(totalGainLossPct).toFixed(2)}% Overall Returns
            </span>
          </div>

          <div className="p-4 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-1">
            <span className="text-xs font-semibold text-[#78716C] block">Holdings & Asset Classes</span>
            <div className="text-xl font-serif font-bold text-[#1C1917] tabular-nums">
              {totalHoldingsCount} Assets
            </div>
            <span className="text-[10px] text-[#78716C] block">
              Across {dashboard?.assetAllocation?.length || (totalHoldingsCount > 0 ? 1 : 0)} diversified classes
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4 MAIN TABS NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-[#E7E5E4]">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'dashboard'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <PieChartIcon className="h-4 w-4" />
          <span>Dashboard & Allocation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('holdings')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'holdings'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Holdings Ledger ({totalHoldingsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('growth')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'growth'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Calculator className="h-4 w-4 text-[#B45309]" />
          <span>Growth Outlook (1Y/3Y/5Y)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drawdown')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'drawdown'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          <span>Equity Drawdown Check</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DASHBOARD & ALLOCATION */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {totalHoldingsCount === 0 ? (
            <EmptyState
              headline="No portfolio holdings yet"
              subtext="Add your stocks, mutual funds, gold bullion, or fixed deposits to unlock live valuation tracking and growth modeling."
              icon={TrendingUp}
              action={{
                label: 'Add First Holding',
                onClick: () => setIsAddHoldingOpen(true),
              }}
              secondaryAction={{
                label: 'Seed Realistic Sample Data',
                onClick: handleSeedSampleData,
              }}
            />
          ) : (
            <>
              {/* Asset Allocation Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">Multi-Asset Allocation Breakdown</h3>
                    <p className="text-[11px] text-[#78716C]">
                      Target balance split across Equity, Debt & Fixed Income, Precious Metals, and Real Assets
                    </p>
                  </div>
                </div>

                {/* Visual Allocation Stack Bar */}
                <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden flex">
                  {(dashboard?.assetAllocation || []).map((item, idx) => {
                    const colors = [
                      'bg-[#C27D38]',
                      'bg-[#1B6B44]',
                      'bg-[#355260]',
                      'bg-[#8E561C]',
                      'bg-[#7D4E5B]',
                      'bg-stone-800',
                    ];
                    const color = colors[idx % colors.length];
                    const pctVal = Number(item.percentage) || 0;
                    return (
                      <div
                        key={item.label || idx}
                        style={{ width: `${Math.max(1, pctVal)}%` }}
                        className={`${color} h-full transition-all`}
                        title={`${item.label}: ${pctVal.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>

                {/* Allocation Grid Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                  {(dashboard?.assetAllocation || []).map((item) => {
                    const pctVal = Number(item.percentage) || 0;
                    return (
                      <div key={item.label} className="p-3 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
                          {item.label}
                        </span>
                        <div className="text-sm font-bold text-[#1C1917] tabular-nums">
                          <Money amount={item.amount || 0} />
                        </div>
                        <span className="text-[11px] font-semibold text-[#B45309] block">
                          {pctVal.toFixed(1)}% Allocation
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Mini Panels for Multi-Asset Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. NPS Allocation Split */}
                {dashboard?.npsSchemeAllocation && (
                  <div className="p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
                        <ShieldCheck className="h-4 w-4 text-[#C27D38]" />
                        <span>NPS Tier-1 Allocation</span>
                      </div>
                      <span className="text-[10px] text-[#78716C]">PFRDA Split</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="p-2 bg-[#FAFAF9] rounded-lg">
                        <span className="text-[10px] text-[#78716C] block">Equity (E)</span>
                        <span className="font-bold text-[#1C1917]">
                          {(dashboard.npsSchemeAllocation.equityPct || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="p-2 bg-[#FAFAF9] rounded-lg">
                        <span className="text-[10px] text-[#78716C] block">Corp Debt (C)</span>
                        <span className="font-bold text-[#1C1917]">
                          {(dashboard.npsSchemeAllocation.corporateDebtPct || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="p-2 bg-[#FAFAF9] rounded-lg">
                        <span className="text-[10px] text-[#78716C] block">G-Sec (G)</span>
                        <span className="font-bold text-[#1C1917]">
                          {(dashboard.npsSchemeAllocation.governmentSecuritiesPct || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Precious Metals Mini Panel */}
                {dashboard?.metalsMiniPanel && (
                  <div className="p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
                        <Coins className="h-4 w-4 text-amber-600" />
                        <span>Bullion Valuation</span>
                      </div>
                      <span className="text-[10px] text-[#78716C]">Live Bullion API</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <span className="text-[10px] text-[#78716C] block">Current Gold/Silver Value</span>
                        <span className="text-base font-bold text-[#1C1917] tabular-nums">
                          <Money amount={dashboard.metalsMiniPanel.totalValue || 0} />
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#78716C] block">Bullion Gain/Loss</span>
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            (dashboard.metalsMiniPanel.gainLoss || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {(dashboard.metalsMiniPanel.gainLoss || 0) >= 0 ? '+' : ''}
                          <Money amount={dashboard.metalsMiniPanel.gainLoss || 0} />
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Highest Mover Callout */}
                {dashboard?.highestProfitHolding && (
                  <div className="p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <TrendingUp className="h-4 w-4 text-emerald-700" />
                        <span>Top Performer</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        +{(dashboard.highestProfitHolding.gainLossPct || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-sm font-bold text-[#1C1917] block truncate">
                        {dashboard.highestProfitHolding.name}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 block mt-0.5 tabular-nums">
                        +<Money amount={dashboard.highestProfitHolding.gainLoss || 0} /> total gain
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Breakdown & Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightsCard
                  type="positive"
                  sourceModule="PORTFOLIO"
                  title="Multi-Asset Live Valuation Engine"
                  description="Quotes for stocks, ETFs, mutual funds, and precious metals update via the Strategy+Factory+Caffeine pricing engine with in-memory caching."
                  metric={`₹${((presentVal) / 100000).toFixed(2)}L Portfolio`}
                />

                <InsightsCard
                  type="neutral"
                  sourceModule="PORTFOLIO"
                  title="Cross-Module Portfolio Sync"
                  description="Read-only portfolio summaries are exposed at /api/v1/portfolio/summary, feeding Net Worth Tracker balance sheets and Goal Manager links."
                  metric={`${totalHoldingsCount} Linked Assets`}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: HOLDINGS LEDGER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'ALL', label: 'All Holdings' },
                { id: 'STOCK', label: 'Stocks' },
                { id: 'ETF', label: 'ETFs' },
                { id: 'MUTUAL_FUND', label: 'Mutual Funds' },
                { id: 'NPS', label: 'NPS' },
                { id: 'DEPOSIT', label: 'Deposits' },
                { id: 'BOND', label: 'Bonds' },
                { id: 'METAL', label: 'Gold/Metals' },
                { id: 'REAL_ESTATE', label: 'Real Estate' },
                { id: 'OTHER', label: 'Others' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHoldingsFilter(f.id as any)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    holdingsFilter === f.id
                      ? 'bg-[#B88728] text-white border-[#B88728] shadow-xs'
                      : 'bg-[#FAFAF9] text-[#78716C] border-[#E7E5E4] hover:text-[#1C1917]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search holdings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 pl-8 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
              />
              <Search className="h-3.5 w-3.5 text-[#78716C] absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Holdings Tables */}
          {/* 1. STOCKS */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'STOCK') && stocks.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Equities / Stocks ({stocks.length})</span>
                <span className="text-[10px] text-[#78716C]">NSE, BSE & US Stocks</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Ticker / Company</th>
                    <th className="py-2.5 px-4">Market</th>
                    <th className="py-2.5 px-4 text-right">Quantity</th>
                    <th className="py-2.5 px-4 text-right">Avg Cost</th>
                    <th className="py-2.5 px-4 text-right">Live Price</th>
                    <th className="py-2.5 px-4 text-right">Current Value</th>
                    <th className="py-2.5 px-4 text-right">Gain / Loss</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {stocks
                    .filter(
                      (s) =>
                        !searchQuery ||
                        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (s.name || s.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAFAF9]">
                        <td className="py-2.5 px-4">
                          <div className="font-bold text-[#1C1917]">{s.ticker}</div>
                          <div className="text-[10px] text-[#78716C]">{s.name || s.companyName || s.ticker}</div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-stone-100 border border-stone-200">
                            {s.market}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold tabular-nums">{s.quantity}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums">
                          <Money amount={s.avgCostPerUnit} />
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-700 tabular-nums">
                          <Money amount={s.currentPrice} />
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                          <Money amount={s.currentValue} />
                        </td>
                        <td className="py-2.5 px-4 text-right tabular-nums">
                          <span className={s.gainLoss >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {s.gainLoss >= 0 ? '+' : ''}
                            <Money amount={s.gainLoss} /> ({Number(s.gainLossPct || 0).toFixed(1)}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              setAddSharesTarget({
                                id: s.id,
                                ticker: s.ticker,
                                companyName: s.name || s.companyName || s.ticker,
                                quantity: s.quantity,
                                avgCost: s.avgCostPerUnit,
                                price: s.currentPrice,
                                isEtf: false,
                              })
                            }
                            className="text-[11px] font-bold text-[#B45309] hover:underline"
                            title="Add shares to recalculate weighted average"
                          >
                            + Add Shares
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHolding('STOCK', s.id)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. ETFS */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'ETF') && etfs.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Exchange Traded Funds (ETFs) ({etfs.length})</span>
                <span className="text-[10px] text-[#78716C]">NSE & US Index ETFs</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Ticker / Name</th>
                    <th className="py-2.5 px-4">Market</th>
                    <th className="py-2.5 px-4 text-right">Quantity</th>
                    <th className="py-2.5 px-4 text-right">Avg Cost</th>
                    <th className="py-2.5 px-4 text-right">Live Price</th>
                    <th className="py-2.5 px-4 text-right">Current Value</th>
                    <th className="py-2.5 px-4 text-right">Gain / Loss</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {etfs.map((e) => (
                    <tr key={e.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-[#1C1917]">{e.ticker}</div>
                        <div className="text-[10px] text-[#78716C]">{e.name}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-stone-100 border border-stone-200">
                          {e.market}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums">{e.quantity}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <Money amount={e.avgCostPerUnit} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700 tabular-nums">
                        <Money amount={e.currentPrice} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={e.currentValue} />
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <span className={e.gainLoss >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {e.gainLoss >= 0 ? '+' : ''}
                          <Money amount={e.gainLoss} /> ({Number(e.gainLossPct || 0).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            setAddSharesTarget({
                              id: e.id,
                              ticker: e.ticker,
                              companyName: e.name,
                              quantity: e.quantity,
                              avgCost: e.avgCostPerUnit,
                              price: e.currentPrice,
                              isEtf: true,
                            })
                          }
                          className="text-[11px] font-bold text-[#B45309] hover:underline"
                        >
                          + Add Units
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding('ETF', e.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. MUTUAL FUNDS */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'MUTUAL_FUND') && mutualFunds.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Mutual Funds ({mutualFunds.length})</span>
                <span className="text-[10px] text-[#78716C]">AMFI Live Daily NAV Quotes</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Scheme Name</th>
                    <th className="py-2.5 px-4">Category / Cap</th>
                    <th className="py-2.5 px-4 text-right">Units</th>
                    <th className="py-2.5 px-4 text-right">Avg NAV</th>
                    <th className="py-2.5 px-4 text-right">Current NAV</th>
                    <th className="py-2.5 px-4 text-right">Current Value</th>
                    <th className="py-2.5 px-4 text-right">Gain / Loss</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {mutualFunds.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-2.5 px-4 font-bold text-[#1C1917]">{m.schemeName}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {m.category} {m.capitalisation ? `· ${m.capitalisation}` : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums">{m.units}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <Money amount={m.avgNav} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700 tabular-nums">
                        <Money amount={m.currentNav} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={m.currentValue} />
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <span className={m.gainLoss >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {m.gainLoss >= 0 ? '+' : ''}
                          <Money amount={m.gainLoss} /> ({Number(m.gainLossPct || 0).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding('MUTUAL_FUND', m.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. NPS */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'NPS') && npsList.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">National Pension System (NPS) ({npsList.length})</span>
                <span className="text-[10px] text-[#78716C]">Tier-1 Pension Scheme Split</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Fund Manager</th>
                    <th className="py-2.5 px-4">E / C / G % Split</th>
                    <th className="py-2.5 px-4 text-right">Units</th>
                    <th className="py-2.5 px-4 text-right">Avg NAV</th>
                    <th className="py-2.5 px-4 text-right">Current Value</th>
                    <th className="py-2.5 px-4 text-right">Gain / Loss</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {npsList.map((n) => (
                    <tr key={n.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-2.5 px-4 font-bold text-[#1C1917]">{n.pensionFundManager}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-stone-100 text-stone-800">
                          {n.equityPct}% E · {n.corporateDebtPct}% C · {n.governmentSecuritiesPct}% G
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums">{n.units}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <Money amount={n.avgNav} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={n.currentValue} />
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <span className={n.gainLoss >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {n.gainLoss >= 0 ? '+' : ''}
                          <Money amount={n.gainLoss} /> ({Number(n.gainLossPct || 0).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding('NPS', n.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. DEPOSITS */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'DEPOSIT') && deposits.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Fixed & Recurring Deposits ({deposits.length})</span>
                <span className="text-[10px] text-[#78716C]">Computed Accrual & Maturity Schedules</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Bank / Institution</th>
                    <th className="py-2.5 px-4">Type & Rate</th>
                    <th className="py-2.5 px-4">Tenure / Maturity</th>
                    <th className="py-2.5 px-4 text-right">Principal</th>
                    <th className="py-2.5 px-4 text-right">Estimated Value</th>
                    <th className="py-2.5 px-4 text-right">Maturity Amount</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-2.5 px-4 font-bold text-[#1C1917]">{d.bankName}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {d.depositType} · {d.interestRatePct}% p.a.
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-[#78716C]">
                        {d.startDate} → <span className="font-semibold text-[#1C1917]">{d.maturityDate}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums">
                        <Money amount={d.principalAmount} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={d.currentValue ?? d.currentEstimatedValue ?? d.principalAmount} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700 tabular-nums">
                        <Money amount={d.maturityValue ?? d.maturityAmount ?? d.principalAmount} />
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenSchedule('DEPOSIT', d.id, d.bankName)}
                          className="text-[11px] font-bold text-[#C27D38] hover:underline"
                        >
                          View Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding('DEPOSIT', d.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. BONDS */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'BOND') && bonds.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Bonds & Debentures ({bonds.length})</span>
                <span className="text-[10px] text-[#78716C]">Computed Coupon Payout Schedules</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Bond Name / Issuer</th>
                    <th className="py-2.5 px-4">Coupon Rate</th>
                    <th className="py-2.5 px-4">Maturity Date</th>
                    <th className="py-2.5 px-4 text-right">Purchase Price</th>
                    <th className="py-2.5 px-4 text-right">Current Value</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {bonds.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-[#1C1917]">{b.name}</div>
                        <div className="text-[10px] text-[#78716C]">{b.issuer}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {b.couponRatePct}% · {b.couponFrequency}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[11px] font-semibold text-[#1C1917]">{b.maturityDate}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <Money amount={b.purchasePrice} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={b.currentValue} />
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenSchedule('BOND', b.id, b.name)}
                          className="text-[11px] font-bold text-[#C27D38] hover:underline"
                        >
                          View Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding('BOND', b.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 7. METALS */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'METAL') && metals.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Gold & Bullion ({metals.length})</span>
                <span className="text-[10px] text-[#78716C]">Live Bullion Rates per Gram</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Precious Metal</th>
                    <th className="py-2.5 px-4 text-right">Weight (Grams)</th>
                    <th className="py-2.5 px-4 text-right">Avg Cost / g</th>
                    <th className="py-2.5 px-4 text-right">Live Rate / g</th>
                    <th className="py-2.5 px-4 text-right">Current Value</th>
                    <th className="py-2.5 px-4 text-right">Gain / Loss</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {metals.map((met) => (
                    <tr key={met.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-2.5 px-4 font-bold text-[#1C1917]">
                        {met.metalType} {met.purityKarat ? `(${met.purityKarat}K)` : ''}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums">{met.quantityGrams}g</td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <Money amount={met.avgCostPerGram} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700 tabular-nums">
                        <Money amount={met.currentPricePerGram} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={met.currentValue} />
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <span className={met.gainLoss >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {met.gainLoss >= 0 ? '+' : ''}
                          <Money amount={met.gainLoss} /> ({Number(met.gainLossPct || 0).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding('METAL', met.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 8. REAL ESTATE */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'REAL_ESTATE') && realEstateList.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Real Estate ({realEstateList.length})</span>
                <span className="text-[10px] text-[#78716C]">Physical Properties & Land</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Property / Type</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4 text-right">Purchase Price</th>
                    <th className="py-2.5 px-4 text-right">Estimated Value</th>
                    <th className="py-2.5 px-4 text-right">Gain / Loss</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {realEstateList.map((re) => (
                    <tr key={re.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-[#1C1917]">{re.name}</div>
                        <div className="text-[10px] text-[#78716C]">{re.propertyType}</div>
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-[#78716C]">{re.location || '—'}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <Money amount={re.purchasePrice} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={re.currentEstimatedValue} />
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <span className={re.gainLoss >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {re.gainLoss >= 0 ? '+' : ''}
                          <Money amount={re.gainLoss} /> ({Number(re.gainLossPct || 0).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding('REAL_ESTATE', re.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 9. OTHERS */}
          {(holdingsFilter === 'ALL' || holdingsFilter === 'OTHER') && otherInstruments.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs space-y-2">
              <div className="p-3 bg-[#FAFAF9] border-b border-[#E7E5E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Alternative Assets ({otherInstruments.length})</span>
                <span className="text-[10px] text-[#78716C]">Category Mix Percentage Split</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#78716C] font-semibold uppercase text-[10px] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-4">Asset Name / Category</th>
                    <th className="py-2.5 px-4">Category Mix Split</th>
                    <th className="py-2.5 px-4 text-right">Invested</th>
                    <th className="py-2.5 px-4 text-right">Current Value</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {otherInstruments.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-[#1C1917]">{o.name}</div>
                        <div className="text-[10px] text-[#78716C]">{o.category}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(o.categoryMix || []).map((m, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-stone-100 text-stone-800"
                            >
                              {m.bucket}: {m.percentage}%
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <Money amount={o.investedAmount} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                        <Money amount={o.currentValue} />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteHolding('OTHER', o.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: GROWTH OUTLOOK (1Y / 3Y / 5Y) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E7E5E4] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-[#B45309]" />
                  <h3 className="text-base font-bold text-[#1C1917]">Portfolio Growth Outlook Sandbox</h3>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Compound growth on present valuation plus Future Value of monthly SIP contributions, discounted for inflation.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAFAF9] p-1 rounded-lg border border-[#E7E5E4]">
                {[1, 3, 5, 10].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setGrowthYears(yr)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      growthYears === yr
                        ? 'bg-[#B88728] text-white shadow-xs'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    {yr} {yr === 1 ? 'Year' : 'Years'}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4]">
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#1C1917]">
                  <span>Expected Portfolio Return</span>
                  <span className="text-[#B45309]">{growthReturnPct}% CAGR</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="25"
                  step="0.5"
                  value={growthReturnPct}
                  onChange={(e) => setGrowthReturnPct(Number(e.target.value))}
                  className="w-full accent-[#B45309]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#1C1917]">
                  <span>Monthly Fresh SIP Inflow</span>
                  <span className="text-[#1C1917]">₹{growthMonthlySip.toLocaleString()} / mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={growthMonthlySip}
                  onChange={(e) => setGrowthMonthlySip(Number(e.target.value))}
                  className="w-full accent-[#1C1917]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#1C1917]">
                  <span>Inflation Discount Rate</span>
                  <span className="text-[#78716C]">{growthInflationPct}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={growthInflationPct}
                  onChange={(e) => setGrowthInflationPct(Number(e.target.value))}
                  className="w-full accent-stone-600"
                />
              </div>
            </div>

            {/* Projection Cards */}
            {growthResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#FAF2E8] border border-[#C27D38]/30 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-[#C27D38] block uppercase tracking-wider">
                    {growthYears}-Year Projected Nominal Wealth
                  </span>
                  <div className="text-2xl font-serif font-bold text-[#1C1917] tabular-nums">
                    <Money amount={growthResult.projectedValueNominal} />
                  </div>
                  <span className="text-[11px] text-[#78716C] block">
                    Starting Base + ₹{(((growthMonthlySip * 12 * growthYears)) / 100000).toFixed(2)}L SIP additions
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-emerald-800 block uppercase tracking-wider">
                    Real Inflation-Adjusted Purchasing Power
                  </span>
                  <div className="text-2xl font-serif font-bold text-emerald-950 tabular-nums">
                    <Money amount={growthResult.projectedValueReal ?? growthResult.projectedValueNominal} />
                  </div>
                  <span className="text-[11px] text-emerald-800 block">
                    Discounted in today's rupee purchasing power (@ {growthInflationPct}%)
                  </span>
                </div>

                <div className="p-4 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl space-y-1">
                  <span className="text-xs font-bold text-[#1C1917] block uppercase tracking-wider">
                    Capital Accumulation Trajectory
                  </span>
                  <div className="text-xl font-bold text-[#1C1917] tabular-nums">
                    +
                    {(
                      ((growthResult.projectedValueNominal - presentVal) /
                        Math.max(1, presentVal)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <span className="text-[11px] text-[#78716C] block">
                    Net portfolio expansion over {growthYears} years
                  </span>
                </div>
              </div>
            )}

            {/* Projection Series Table */}
            {growthResult && growthResult.series && growthResult.series.length > 0 && (
              <div className="border border-[#E7E5E4] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#78716C] font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Timeline</th>
                      <th className="py-2.5 px-4 text-right">Cumulative Fresh Capital</th>
                      <th className="py-2.5 px-4 text-right">Nominal Projected Wealth</th>
                      <th className="py-2.5 px-4 text-right">Real Purchasing Power</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {growthResult.series.map((pt) => {
                      const cumSip = growthMonthlySip * 12 * pt.year;
                      return (
                        <tr key={pt.year} className="hover:bg-[#FAFAF9]">
                          <td className="py-2.5 px-4 font-bold text-[#1C1917]">Year {pt.year}</td>
                          <td className="py-2.5 px-4 text-right tabular-nums">
                            <Money amount={cumSip} />
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1C1917] tabular-nums">
                            <Money amount={pt.nominalValue} />
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-800 tabular-nums">
                            <Money amount={pt.realValue ?? pt.nominalValue} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: EQUITY DRAWDOWN CHECK */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'drawdown' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E7E5E4] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  <h3 className="text-base font-bold text-[#1C1917]">Equity Drawdown Stress Testing</h3>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Simulates a market crash scenario applied <strong>strictly to your equity holdings</strong> (Stocks, ETFs, Equity MFs, NPS Equity), demonstrating your non-equity buffer and estimated recovery timeline.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAFAF9] p-1 rounded-lg border border-[#E7E5E4]">
                {[15, 25, 35, 50].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDropPct(d)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      dropPct === d
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    -{d}% Drop
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4]">
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#1C1917]">
                  <span>Equity Market Crash Depth</span>
                  <span className="text-rose-700 font-bold">-{dropPct}% Drop</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={dropPct}
                  onChange={(e) => setDropPct(Number(e.target.value))}
                  className="w-full accent-rose-700"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#1C1917]">
                  <span>Post-Crash Recovery Return Rate</span>
                  <span className="text-emerald-700 font-bold">+{recoveryReturnPct}% CAGR</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={recoveryReturnPct}
                  onChange={(e) => setRecoveryReturnPct(Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>
            </div>

            {/* Drawdown Result Cards */}
            {drawdownResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-rose-800 block uppercase tracking-wider">
                    Simulated Portfolio Value (After Crash)
                  </span>
                  <div className="text-2xl font-serif font-bold text-rose-950 tabular-nums">
                    <Money amount={drawdownResult.portfolioValueAfterDrop ?? drawdownResult.portfolioAfterDrop ?? 0} />
                  </div>
                  <span className="text-[11px] text-rose-700 font-semibold block">
                    {Number(drawdownResult.portfolioLevelImpactPct ?? drawdownResult.totalPortfolioDropPct ?? 0).toFixed(1)}% Overall Portfolio Impact
                  </span>
                </div>

                <div className="p-4 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl space-y-1">
                  <span className="text-xs font-bold text-[#1C1917] block uppercase tracking-wider">
                    Absolute Equity Loss
                  </span>
                  <div className="text-2xl font-serif font-bold text-rose-700 tabular-nums">
                    -<Money amount={drawdownResult.equityLoss || 0} />
                  </div>
                  <span className="text-[11px] text-[#78716C] block">
                    From ₹{(((drawdownResult.equityBeforeDrop || 0)) / 100000).toFixed(2)}L equity base
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-emerald-800 block uppercase tracking-wider">
                    Estimated Time to Recover
                  </span>
                  <div className="text-2xl font-serif font-bold text-emerald-950 tabular-nums">
                    {Number(drawdownResult.estimatedYearsToRecover || 0).toFixed(1)} Years
                  </div>
                  <span className="text-[11px] text-emerald-800 block">
                    At +{recoveryReturnPct}% annual recovery compounding
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALS & ONBOARDING */}
      {/* ------------------------------------------------------------- */}
      <AddHoldingModal
        isOpen={isAddHoldingOpen}
        onClose={() => setIsAddHoldingOpen(false)}
        onHoldingAdded={loadPortfolioData}
      />

      {addSharesTarget && (
        <AddSharesModal
          isOpen={!!addSharesTarget}
          onClose={() => setAddSharesTarget(null)}
          holdingName={addSharesTarget.companyName}
          ticker={addSharesTarget.ticker}
          currentQuantity={addSharesTarget.quantity}
          currentAvgCost={addSharesTarget.avgCost}
          currentPrice={addSharesTarget.price}
          onSubmit={async (req) => {
            if (addSharesTarget.isEtf) {
              await portfolioApi.addSharesToEtf(addSharesTarget.id, req);
            } else {
              await portfolioApi.addSharesToStock(addSharesTarget.id, req);
            }
            toast.success('Shares added and weighted-average cost recalculated');
            await loadPortfolioData();
          }}
        />
      )}

      {scheduleModalTarget && (
        <ScheduleModal
          isOpen={!!scheduleModalTarget}
          onClose={() => setScheduleModalTarget(null)}
          title={scheduleModalTarget.title}
          type={scheduleModalTarget.type}
          depositSchedule={scheduleModalTarget.depositSchedule}
          bondSchedule={scheduleModalTarget.bondSchedule}
        />
      )}

      <OnboardingDrawer
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        moduleName="Portfolio Tracker"
        subtitle="Multi-Asset Holdings & Valuation Engine"
        icon={TrendingUp}
        steps={PORTFOLIO_ONBOARDING_STEPS}
        tipsChecklist={PORTFOLIO_TIPS}
        storageKey="finora_portfolio_onboarding"
      />
    </div>
  );
};

export default PortfolioTracker;
