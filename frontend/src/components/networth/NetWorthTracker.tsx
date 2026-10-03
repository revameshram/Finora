import React, { useState, useEffect } from 'react';
import { networthApi } from '../../services/networthApi';
import {
  AssetDto,
  NetWorthLiabilityDto,
  NetWorthSummaryDto,
  NetWorthProjectionResponseDto,
  NetWorthInsightsDto,
  CreateAssetRequest,
  CreateLiabilityRequest,
} from '../../types/networth';
import { SourceModule } from '../../types';
import { Money, InsightsCard, LinkedBadge, IncludeToggle, EmptyState, OnboardingDrawer } from '../shared';
import { useToast } from '../shared/ToastContext';
import { AddAssetModal } from './AddAssetModal';
import { AddLiabilityModal } from './AddLiabilityModal';
import {
  Layers,
  TrendingUp,
  ShieldAlert,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  Lock,
  Search,
  Sparkles,
  Activity,
  Calculator,
  CheckCircle2,
  Info,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface NetWorthTrackerProps {
  onNavigateToModule?: (moduleId: string) => void;
}

export const NetWorthTracker: React.FC<NetWorthTrackerProps> = ({ onNavigateToModule }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities' | 'summary'>('assets');

  // State
  const [summary, setSummary] = useState<NetWorthSummaryDto | null>(null);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [liabilities, setLiabilities] = useState<NetWorthLiabilityDto[]>([]);
  const [insights, setInsights] = useState<NetWorthInsightsDto | null>(null);
  const [projections, setProjections] = useState<NetWorthProjectionResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isAddLiabilityOpen, setIsAddLiabilityOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Filters & Search
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCatFilter, setAssetCatFilter] = useState<string>('ALL');
  const [liabilitySearch, setLiabilitySearch] = useState('');
  const [liabilityCatFilter, setLiabilityCatFilter] = useState<string>('ALL');

  // Projection Inputs
  const [conservativeCagr, setConservativeCagr] = useState(5.0);
  const [moderateCagr, setModerateCagr] = useState(10.0);
  const [aggressiveCagr, setAggressiveCagr] = useState(15.0);
  const [monthlySavings, setMonthlySavings] = useState(25000);
  const [inflationPct, setInflationPct] = useState(6.0);
  const [projectionYears, setProjectionYears] = useState(10);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, assetsRes, liabRes, insRes] = await Promise.all([
        networthApi.getSummary(),
        networthApi.getAssets(),
        networthApi.getLiabilities(),
        networthApi.getInsights(),
      ]);

      setSummary(sumRes);
      setAssets(assetsRes);
      setLiabilities(liabRes);
      setInsights(insRes);

      // Initial Projections
      const projRes = await networthApi.calculateProjections({
        conservativeCagrPct: conservativeCagr,
        moderateCagrPct: moderateCagr,
        aggressiveCagrPct: aggressiveCagr,
        monthlySavingsContribution: monthlySavings,
        inflationPct,
        years: projectionYears,
      });
      setProjections(projRes);
    } catch (err) {
      console.error('Failed to load Net Worth data:', err);
      toast.error('Failed to load Net Worth Tracker data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecalculateProjections = async () => {
    try {
      const projRes = await networthApi.calculateProjections({
        conservativeCagrPct: conservativeCagr,
        moderateCagrPct: moderateCagr,
        aggressiveCagrPct: aggressiveCagr,
        monthlySavingsContribution: monthlySavings,
        inflationPct,
        years: projectionYears,
      });
      setProjections(projRes);
      toast.success('Recalculated 3-scenario growth projections');
    } catch (err) {
      toast.error('Failed to calculate projections');
    }
  };

  const handleSeedSample = async () => {
    try {
      await networthApi.seedSampleData();
      toast.success('Seeded realistic Indian assets & liabilities fixtures!');
      loadData();
    } catch (err) {
      toast.error('Failed to seed sample data');
    }
  };

  // Asset Actions
  const handleCreateAsset = async (req: CreateAssetRequest) => {
    await networthApi.createAsset(req);
    toast.success(`Added asset "${req.name}"`);
    loadData();
  };

  const handleToggleAssetInclude = async (asset: AssetDto) => {
    await networthApi.updateAsset(asset.id, { isIncluded: !asset.isIncluded });
    toast.info(`${!asset.isIncluded ? 'Included' : 'Excluded'} "${asset.name}" in rollups`);
    loadData();
  };

  const handleDelinkAsset = async (id: string) => {
    await networthApi.delinkAsset(id);
    toast.success('Delinked portfolio asset into standalone manual holding');
    loadData();
  };

  const handleDeleteAsset = async (id: string) => {
    await networthApi.deleteAsset(id);
    toast.success('Asset removed');
    loadData();
  };

  // Liability Actions
  const handleCreateLiability = async (req: CreateLiabilityRequest) => {
    await networthApi.createLiability(req);
    toast.success(`Added liability "${req.name}"`);
    loadData();
  };

  const handleToggleLiabilityInclude = async (liab: NetWorthLiabilityDto) => {
    await networthApi.updateLiability(liab.id, { isIncluded: !liab.isIncluded });
    toast.info(`${!liab.isIncluded ? 'Enabled' : 'Disabled'} "${liab.name}" in liabilities calculation`);
    loadData();
  };

  const handleDelinkLiability = async (id: string) => {
    await networthApi.delinkLiability(id);
    toast.success('Delinked loan into standalone manual debt');
    loadData();
  };

  const handleDeleteLiability = async (id: string) => {
    await networthApi.deleteLiability(id);
    toast.success('Liability record removed');
    loadData();
  };

  // Filtered Lists
  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(assetSearch.toLowerCase()) || (a.notes && a.notes.toLowerCase().includes(assetSearch.toLowerCase()));
    const matchesCat = assetCatFilter === 'ALL' || a.category === assetCatFilter;
    return matchesSearch && matchesCat;
  });

  const filteredLiabilities = liabilities.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(liabilitySearch.toLowerCase()) || (l.notes && l.notes.toLowerCase().includes(liabilitySearch.toLowerCase()));
    const matchesCat = liabilityCatFilter === 'ALL' || l.category === liabilityCatFilter;
    return matchesSearch && matchesCat;
  });

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-[#78716C]">
        Loading Net Worth Tracker & Growth Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1C1917] rounded-lg text-[#FEF3C7]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">Wealth & Growth</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30">
                  Consolidated
                </span>
              </div>
              <h1 className="text-xl font-serif font-bold text-[#1C1917] mt-0.5">Net Worth Tracker & Growth Engine</h1>
            </div>
          </div>
          <p className="text-xs text-[#78716C] mt-2">
            Consolidated balance sheet, portfolio-linked assets, loan liabilities, and shared 3-scenario compound growth simulations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSeedSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#B45309] bg-[#FEF3C7] hover:bg-amber-200 rounded-lg border border-[#B45309]/30 transition-colors shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Try with Sample Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddAssetOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-[#FEF3C7]" />
            <span>Add Asset</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddLiabilityOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#BE123C] bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors shadow-2xs"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Add Liability</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Rollup KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C]">Total Net Worth</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-serif font-bold text-[#1C1917] mt-1 tabular-nums">
            <Money amount={summary?.netWorth || 0} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#78716C] mt-1">
            <span>Assets − Liabilities</span>
            <span className="text-emerald-700 font-bold">Health Score: {summary?.healthScore}/100</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C]">Total Included Assets</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-serif font-bold text-emerald-700 mt-1 tabular-nums">
            <Money amount={summary?.totalAssets || 0} />
          </div>
          <div className="text-[10px] text-[#78716C] mt-1 flex items-center justify-between">
            <span>Manual: <Money amount={summary?.manualAssetsTotal || 0} /></span>
            <span>Linked: <Money amount={summary?.portfolioLinkedAssetsTotal || 0} /></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C]">Total Liabilities</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-xl font-serif font-bold text-rose-700 mt-1 tabular-nums">
            <Money amount={summary?.totalLiabilities || 0} />
          </div>
          <div className="text-[10px] text-[#78716C] mt-1">
            Debt-to-Asset: <span className="font-bold text-[#1C1917]">{summary?.debtToAssetRatioPct || 0}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C]">30-Day Velocity</span>
            <Zap className="h-4 w-4 text-[#B45309]" />
          </div>
          <div className="text-xl font-serif font-bold text-[#B45309] mt-1 tabular-nums">
            <Money amount={summary?.thirtyDayVelocity || 0} />
          </div>
          <div className="text-[10px] text-[#78716C] mt-1">
            Snapshot change over 30 days
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-px">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'assets'
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span>Assets ({assets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('liabilities')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'liabilities'
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>Liabilities ({liabilities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-[#1C1917] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <PieChartIcon className="h-4 w-4 text-[#B45309]" />
            <span>Summary & Projections Engine</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOnboardingOpen(true)}
          className="text-xs text-[#78716C] hover:text-[#1C1917] font-semibold hidden sm:inline"
        >
          Guide & Rules
        </button>
      </div>

      {/* TAB 1: ASSETS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          {/* Portfolio-Linked Nuance Callout Banner */}
          {summary && summary.portfolioLinkedAssetsTotal > 0 && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                <span>
                  <strong>Portfolio-Linked Sync Active:</strong> <Money amount={summary.portfolioLinkedAssetsTotal} /> in live holdings is synced from Portfolio Tracker into your balance sheet.
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-300">
                Held Flat (0% CAGR) in Growth Projections
              </span>
            </div>
          )}

          {/* Filter Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E7E5E4]">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search assets..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-[#78716C]">Category:</span>
              <select
                value={assetCatFilter}
                onChange={(e) => setAssetCatFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#E7E5E4] bg-white focus:outline-none focus:border-[#1C1917]"
              >
                <option value="ALL">All Categories</option>
                <option value="CASH_BANK">Cash & Bank</option>
                <option value="INVESTMENTS">Investments</option>
                <option value="CRYPTO">Crypto</option>
                <option value="GOLD_SILVER">Gold & Silver</option>
                <option value="REAL_ESTATE">Real Estate</option>
                <option value="VEHICLES">Vehicles</option>
                <option value="RETIREMENT_ACCOUNTS">Retirement</option>
                <option value="BUSINESS_ASSETS">Business Assets</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Assets Table */}
          {filteredAssets.length === 0 ? (
            <EmptyState
              headline="No assets found"
              subtext="Add manual bank accounts, real estate, gold, or seed sample assets to view your holdings."
              icon={TrendingUp}
              action={{
                label: 'Add First Asset',
                onClick: () => setIsAddAssetOpen(true),
              }}
            />
          ) : (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#78716C] font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Asset Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Origin / Sync</th>
                    <th className="py-3 px-4 text-right">Value (₹)</th>
                    <th className="py-3 px-4 text-center">In Rollups</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1C1917]">{asset.name}</div>
                        {asset.notes && <div className="text-[10px] text-[#78716C] mt-0.5 truncate max-w-xs">{asset.notes}</div>}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-stone-100 text-stone-800 border border-stone-200">
                          {asset.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <LinkedBadge
                          isLinked={asset.isLinked}
                          sourceModule={asset.sourceModule as SourceModule}
                          onDelink={() => handleDelinkAsset(asset.id)}
                        />
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-[#1C1917] tabular-nums text-sm">
                        <Money amount={asset.value} />
                        {asset.growthRatePct && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            +{asset.growthRatePct}% p.a.
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <IncludeToggle
                          isIncluded={asset.isIncluded}
                          onToggle={() => handleToggleAssetInclude(asset)}
                          label=""
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1 text-[#78716C] hover:text-[#BE123C] rounded transition-colors"
                          title="Delete Asset"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* TAB 2: LIABILITIES */}
      {activeTab === 'liabilities' && (
        <div className="space-y-4">
          {/* Filter Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E7E5E4]">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search liabilities..."
                value={liabilitySearch}
                onChange={(e) => setLiabilitySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-[#78716C]">Category:</span>
              <select
                value={liabilityCatFilter}
                onChange={(e) => setLiabilityCatFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#E7E5E4] bg-white focus:outline-none focus:border-[#1C1917]"
              >
                <option value="ALL">All Categories</option>
                <option value="HOME_LOAN">Home Loan</option>
                <option value="CAR_LOAN">Car Loan</option>
                <option value="PERSONAL_LOAN">Personal Loan</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="STUDENT_LOAN">Student Loan</option>
                <option value="BUSINESS_LOAN">Business Loan</option>
                <option value="OTHER_DEBT">Other Debt</option>
              </select>
            </div>
          </div>

          {/* Liabilities Table */}
          {filteredLiabilities.length === 0 ? (
            <EmptyState
              headline="No liabilities recorded"
              subtext="Add loan obligations, mortgages, or credit card debt to calculate your debt ratio accurately."
              icon={ShieldAlert}
              action={{
                label: 'Add First Liability',
                onClick: () => setIsAddLiabilityOpen(true),
              }}
            />
          ) : (
            <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#78716C] font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Liability Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Origin / Sync</th>
                    <th className="py-3 px-4 text-right">Outstanding (₹)</th>
                    <th className="py-3 px-4 text-right">Interest / EMI</th>
                    <th className="py-3 px-4 text-center">Active in Calc</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {filteredLiabilities.map((liab) => (
                    <tr key={liab.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1C1917]">{liab.name}</div>
                        {liab.notes && <div className="text-[10px] text-[#78716C] mt-0.5 truncate max-w-xs">{liab.notes}</div>}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-800 border border-rose-200">
                          {liab.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <LinkedBadge
                          isLinked={liab.isLinked}
                          sourceModule={liab.sourceModule as SourceModule}
                          onDelink={() => handleDelinkLiability(liab.id)}
                        />
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-[#BE123C] tabular-nums text-sm">
                        <Money amount={liab.balance} />
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-[#1C1917] tabular-nums">
                        {liab.interestRatePct && <div>{liab.interestRatePct}% p.a.</div>}
                        {liab.monthlyPayment && (
                          <div className="text-[10px] text-[#78716C]">
                            EMI: <Money amount={liab.monthlyPayment} />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <IncludeToggle
                          isIncluded={liab.isIncluded}
                          onToggle={() => handleToggleLiabilityInclude(liab)}
                          label=""
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteLiability(liab.id)}
                          className="p-1 text-[#78716C] hover:text-[#BE123C] rounded transition-colors"
                          title="Delete Liability"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* TAB 3: SUMMARY & PROJECTIONS ENGINE */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Section 1: Shared Growth Engine Library Sandbox */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E7E5E4] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-[#B45309]" />
                  <h2 className="text-base font-bold text-[#1C1917]">Shared Growth Engine Library (`CompoundGrowthEngine`)</h2>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Multi-scenario compound growth (FV = PV(1+r)^n), SIP annuity math, and inflation discounting. Exposes public interface consumed by Goal Manager and FIRE Planner.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRecalculateProjections}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg shadow-xs transition-colors"
              >
                <Calculator className="h-3.5 w-3.5 text-[#FEF3C7]" />
                <span>Recalculate Scenarios</span>
              </button>
            </div>

            {/* Portfolio Flat Growth Nuance Banner */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Portfolio-Linked Flat Growth Nuance:</strong> Linked investments (<Money amount={projections?.portfolioLinkedAssetsHeldFlat || 0} />) are included in current Net Worth balance but held flat (0% CAGR) in projections to prevent double-counting against Portfolio Tracker forecasts. Manual assets (<Money amount={projections?.manualAssetsTotal || 0} />) + monthly savings grow at scenario rates.
                </div>
              </div>
              {onNavigateToModule && (
                <button
                  type="button"
                  onClick={() => onNavigateToModule('portfolio-tracker')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 border border-amber-400/60 rounded-lg transition-colors flex-shrink-0 self-start sm:self-auto shadow-xs"
                >
                  <span>Open Portfolio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sandbox Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4]">
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Conservative CAGR (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={conservativeCagr}
                  onChange={(e) => setConservativeCagr(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Moderate CAGR (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={moderateCagr}
                  onChange={(e) => setModerateCagr(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Aggressive CAGR (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={aggressiveCagr}
                  onChange={(e) => setAggressiveCagr(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Monthly SIP Contribution (₹)</label>
                <input
                  type="number"
                  step="1000"
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold tabular-nums rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Inflation Discount (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inflationPct}
                  onChange={(e) => setInflationPct(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Time Horizon (Years)</label>
                <select
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E7E5E4] bg-white focus:outline-none focus:border-[#1C1917]"
                >
                  <option value={5}>5 Years</option>
                  <option value={10}>10 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>
            </div>

            {/* 3 Growth Scenario Cards */}
            {projections && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Conservative */}
                <div className="p-4 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2">
                    <span className="text-xs font-bold text-[#1C1917]">{projections.conservativeScenario.scenarioName}</span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {projections.conservativeScenario.cagrPct}% CAGR
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider block">Projected Nominal NW</span>
                    <div className="text-xl font-serif font-bold text-[#1C1917] tabular-nums mt-0.5">
                      <Money amount={projections.conservativeScenario.projectedNetWorthNominal} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E7E5E4] space-y-1 text-xs">
                    <div className="flex justify-between text-[#78716C]">
                      <span>Real Purchasing Power:</span>
                      <span className="font-bold text-[#1C1917] tabular-nums"><Money amount={projections.conservativeScenario.projectedNetWorthReal} /></span>
                    </div>
                    <div className="flex justify-between text-[#78716C]">
                      <span>Rule-of-72 Hint:</span>
                      <span className="font-semibold text-blue-700">Doubles in ~{projections.conservativeScenario.doublesInYears} yrs</span>
                    </div>
                  </div>
                </div>

                {/* Moderate */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="text-xs font-bold text-emerald-950">{projections.moderateScenario.scenarioName} (Baseline)</span>
                    <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {projections.moderateScenario.cagrPct}% CAGR
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">Projected Nominal NW</span>
                    <div className="text-xl font-serif font-bold text-emerald-900 tabular-nums mt-0.5">
                      <Money amount={projections.moderateScenario.projectedNetWorthNominal} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 space-y-1 text-xs">
                    <div className="flex justify-between text-emerald-800">
                      <span>Real Purchasing Power:</span>
                      <span className="font-bold text-emerald-950 tabular-nums"><Money amount={projections.moderateScenario.projectedNetWorthReal} /></span>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>Rule-of-72 Hint:</span>
                      <span className="font-semibold text-emerald-800">Doubles in ~{projections.moderateScenario.doublesInYears} yrs</span>
                    </div>
                  </div>
                </div>

                {/* Aggressive */}
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="text-xs font-bold text-amber-950">{projections.aggressiveScenario.scenarioName}</span>
                    <span className="text-xs font-bold text-[#B45309] bg-white px-2 py-0.5 rounded border border-amber-300">
                      {projections.aggressiveScenario.cagrPct}% CAGR
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">Projected Nominal NW</span>
                    <div className="text-xl font-serif font-bold text-[#B45309] tabular-nums mt-0.5">
                      <Money amount={projections.aggressiveScenario.projectedNetWorthNominal} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200 space-y-1 text-xs">
                    <div className="flex justify-between text-amber-800">
                      <span>Real Purchasing Power:</span>
                      <span className="font-bold text-amber-950 tabular-nums"><Money amount={projections.aggressiveScenario.projectedNetWorthReal} /></span>
                    </div>
                    <div className="flex justify-between text-amber-800">
                      <span>Rule-of-72 Hint:</span>
                      <span className="font-semibold text-[#B45309]">Doubles in ~{projections.aggressiveScenario.doublesInYears} yrs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Category Breakdown & Top Holdings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Category Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1C1917] flex items-center justify-between border-b border-[#E7E5E4] pb-2">
                <span>Asset Allocation Breakdown</span>
                <span className="text-xs text-[#78716C] font-normal">% of Total Assets</span>
              </h3>

              {summary?.assetsByCategory.length === 0 ? (
                <div className="text-xs text-[#78716C] text-center py-6">No asset data available</div>
              ) : (
                <div className="space-y-3">
                  {summary?.assetsByCategory.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#1C1917]">{cat.category.replace('_', ' ')}</span>
                        <span className="tabular-nums font-bold"><Money amount={cat.amount} /> ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-700 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Holdings Overview */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1C1917] flex items-center justify-between border-b border-[#E7E5E4] pb-2">
                <span>Top Asset Holdings</span>
                <span className="text-xs text-[#78716C] font-normal">Ranked by Value</span>
              </h3>

              {summary?.topAssets.length === 0 ? (
                <div className="text-xs text-[#78716C] text-center py-6">No top holdings recorded</div>
              ) : (
                <div className="space-y-3">
                  {summary?.topAssets.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-[#1C1917] text-white text-xs font-bold flex items-center justify-center">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#1C1917] block">{item.name}</span>
                          <span className="text-[10px] text-[#78716C] uppercase font-semibold">{item.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#1C1917] tabular-nums block"><Money amount={item.amount} /></span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{item.percentageOfTotal}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Financial Health & Insights Panel (§5.4) */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E7E5E4] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#B45309]" />
                  <h3 className="text-sm font-bold text-[#1C1917]">Financial Health & Insights Panel</h3>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Evaluates balance sheet leverage, liquidity cushion, and structural ratios.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider block">Health Score</span>
                  <span className="text-2xl font-serif font-bold text-emerald-700 tabular-nums">
                    {insights?.healthScore || 100} / 100
                  </span>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200">
                  {insights?.healthBadge || 'Excellent'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] space-y-1">
                <span className="text-xs font-semibold text-[#78716C] block">Debt-to-Asset Ratio</span>
                <span className="text-base font-bold text-[#1C1917] block tabular-nums">{insights?.debtToAssetRatioPct || 0}%</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">{insights?.debtToAssetStatus}</span>
              </div>

              <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] space-y-1">
                <span className="text-xs font-semibold text-[#78716C] block">Liquidity Ratio</span>
                <span className="text-base font-bold text-[#1C1917] block tabular-nums">{insights?.liquidityRatioPct || 0}%</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">{insights?.liquidityStatus}</span>
              </div>

              <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] space-y-1">
                <span className="text-xs font-semibold text-[#78716C] block">Largest Asset</span>
                <span className="text-xs font-bold text-[#1C1917] truncate block">{insights?.largestAsset?.name || 'None'}</span>
                <span className="text-[10px] text-[#78716C] block tabular-nums"><Money amount={insights?.largestAsset?.amount || 0} /></span>
              </div>

              <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] space-y-1">
                <span className="text-xs font-semibold text-[#78716C] block">Largest Liability</span>
                <span className="text-xs font-bold text-rose-700 truncate block">{insights?.largestLiability?.name || 'None'}</span>
                <span className="text-[10px] text-[#78716C] block tabular-nums"><Money amount={insights?.largestLiability?.amount || 0} /></span>
              </div>
            </div>

            {/* Recommendation Feed Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Contextual Recommendations Feed</h4>
                {onNavigateToModule && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToModule('emi-manager')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline"
                    >
                      <span>Prepay Loans in EMI Manager</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <span className="text-stone-300">·</span>
                    <button
                      type="button"
                      onClick={() => onNavigateToModule('portfolio-tracker')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B45309] hover:underline"
                    >
                      <span>Open Portfolio</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights?.recommendations.map((rec, i) => (
                  <InsightsCard
                    key={i}
                    type={rec.type}
                    sourceModule="NET_WORTH"
                    title={rec.title}
                    description={rec.description}
                    action={
                      rec.actionLabel
                        ? {
                            label: rec.actionLabel,
                            onClick: () => {
                              if (rec.actionModule === 'EMI_MANAGER') {
                                if (onNavigateToModule) onNavigateToModule('emi-manager');
                                else toast.info('Opening EMI Manager');
                              } else if (rec.actionModule === 'PORTFOLIO') {
                                if (onNavigateToModule) onNavigateToModule('portfolio-tracker');
                                else toast.info('Opening Portfolio Tracker');
                              } else if (rec.actionModule === 'EXPENSE_TRACKER') {
                                if (onNavigateToModule) onNavigateToModule('expense-tracker');
                                else toast.info('Opening Expense Tracker');
                              } else if (rec.actionModule && onNavigateToModule) {
                                onNavigateToModule(rec.actionModule.toLowerCase().replace('_', '-'));
                              } else {
                                toast.info(`Opening ${rec.actionModule || 'module'}`);
                              }
                            },
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        onSubmit={handleCreateAsset}
      />

      {/* Add Liability Modal */}
      <AddLiabilityModal
        isOpen={isAddLiabilityOpen}
        onClose={() => setIsAddLiabilityOpen(false)}
        onSubmit={handleCreateLiability}
      />

      {/* Onboarding Drawer */}
      <OnboardingDrawer
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        moduleName="Net Worth Tracker"
        subtitle="Consolidated Balance Sheet & Growth Engine"
        icon={Layers}
        steps={[
          {
            stepNumber: 1,
            title: 'Track Manual & Portfolio-Linked Assets',
            description: 'Record bank deposits, real estate, and bullion manually. Live portfolio holdings auto-sync from Portfolio Tracker.',
            tip: 'Portfolio-linked assets are included in current Net Worth but held flat (0% CAGR) in projections.',
          },
          {
            stepNumber: 2,
            title: 'Integrated EMI Manager Liability Sync',
            description: 'Loan liabilities created in EMI Manager automatically push records into your Net Worth liability ledger.',
          },
          {
            stepNumber: 3,
            title: 'Shared Growth Engine Library',
            description: 'Simulate Conservative (5%), Moderate (10%), and Aggressive (15%) growth scenarios with inflation discounting and Rule-of-72 double hints.',
          },
        ]}
        tipsChecklist={[
          { id: 'nw_1', label: 'Maintain a debt-to-asset ratio below 30%', completed: true },
          { id: 'nw_2', label: 'Verify portfolio-linked holding values', completed: false },
          { id: 'nw_3', label: 'Set up 3-scenario growth projections', completed: false },
        ]}
        storageKey="networth_onboarding_guide"
      />
    </div>
  );
};
