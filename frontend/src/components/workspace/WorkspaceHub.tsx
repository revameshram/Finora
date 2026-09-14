import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../shared/ToastContext';
import { Money, InsightsCard } from '../shared';
import {
  TrendingUp,
  Receipt,
  Target,
  Flame,
  CreditCard,
  Compass,
  ShieldCheck,
  Layers,
  ArrowRight,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface WorkspaceHubProps {
  onNavigateToModule: (moduleId: string) => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({ onNavigateToModule }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'tools' | 'insights'>('tools');

  // Rollup Stat Block for Profile (sourced from Expense Tracker per §2.1)
  const rollupStats = {
    monthlyInflow: 200000,
    monthlyOutflow: 92500,
    pendingOutflow: 31000,
    netPosition: 138500,
  };

  const MODULE_TILES = [
    {
      id: 'expense-tracker',
      title: 'Expense Tracker',
      tagline: 'Cash Flow Ledger & Envelopes',
      track: 'Track B',
      status: 'Ready',
      icon: Receipt,
      badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
      description: 'Monthly inflows, recurring transactions, settlement states, and envelope budgets in base INR.',
      summaryData: {
        metric: '₹2,00,000 Inflow · ₹92,500 Outflow',
        subtext: '53.8% monthly savings rate',
      },
      cta: 'Open Expense Ledger',
      action: () => onNavigateToModule('expense-tracker'),
    },
    {
      id: 'portfolio-tracker',
      title: 'Portfolio Tracker',
      tagline: 'Multi-Asset Performance & XIRR',
      track: 'Track A',
      status: 'In Progress',
      icon: TrendingUp,
      badgeColor: 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4]',
      description: 'Equities, Mutual Funds, US Stocks, and Bullion with live Yahoo Finance/AMFI valuation.',
      summaryData: {
        metric: '₹42,50,000 Holdings',
        subtext: '+18.4% YoY · Multi-asset allocation',
      },
      cta: 'Preview Holdings',
      action: () => toast.info('Track A: Portfolio Tracker module ships next with Reva'),
    },
    {
      id: 'net-worth-tracker',
      title: 'Net Worth Tracker',
      tagline: 'Assets, Liabilities & Growth Engine',
      track: 'Track A',
      status: 'Ready',
      icon: Layers,
      badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
      description: 'Consolidated balance sheet, compound growth simulations, and liquid-to-liability ratios.',
      summaryData: {
        metric: '₹88,70,000 Net Worth',
        subtext: 'Consolidated assets, loans & growth engine',
      },
      cta: 'View Balance Sheet',
      action: () => onNavigateToModule('net-worth-tracker'),
    },
    {
      id: 'goal-manager',
      title: 'Goal Manager',
      tagline: 'Target Timelines & Investment Links',
      track: 'Track A',
      status: 'Ready',
      icon: Target,
      badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
      description: 'Target-date sinking funds, priority rankings, and automatic portfolio value synchronization.',
      summaryData: {
        metric: '4 Active Financial Goals',
        subtext: 'Next milestone: Emergency Fund in 10 mos',
      },
      cta: 'Manage Goals',
      action: () => onNavigateToModule('goal-manager'),
    },
    {
      id: 'fire-planner',
      title: 'FIRE Planner',
      tagline: 'Financial Independence Engine',
      track: 'Track A',
      status: 'Ready',
      icon: Flame,
      badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
      description: '25x/33x annual spend multiplier models, Safe Withdrawal Rate (SWR) simulators, and Lean/FatFIRE timelines.',
      summaryData: {
        metric: '13.8 Years to FIRE',
        subtext: 'Target retirement at Age 46',
      },
      cta: 'Open FIRE Planner',
      action: () => onNavigateToModule('fire-planner'),
    },
    {
      id: 'vault',
      title: 'Vault',
      tagline: 'Zero-Knowledge Encrypted Locker',
      track: 'Track B',
      status: 'Active',
      icon: ShieldCheck,
      badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
      description: 'Zero-knowledge encrypted locker for sensitive credentials, passphrases, seed keys, and private notes.',
      summaryData: {
        metric: 'AES-256-GCM Locker',
        subtext: 'Client-side zero-knowledge security',
      },
      cta: 'Open Secure Vault',
      action: () => onNavigateToModule('vault'),
    },
    {
      id: 'trip-manager',
      title: 'Trip Manager',
      tagline: 'Multi-Currency Travel Budgets',
      track: 'Track B',
      status: 'Ready',
      icon: Compass,
      badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
      description: 'Itinerary budgeting, group expense splitting, and live currency conversions during travel.',
      summaryData: {
        metric: 'Multi-Currency Trips',
        subtext: 'EUR, USD, GBP, JPY, VND real-time splits',
      },
      cta: 'Manage Itineraries',
      action: () => onNavigateToModule('trip-manager'),
    },
    {
      id: 'emi-manager',
      title: 'EMI Manager',
      tagline: 'Amortization & Prepayment Calculator',
      track: 'Track B',
      status: 'Ready',
      icon: CreditCard,
      badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30',
      description: 'Loan amortization visualizers, interest-to-principal breakdown, and prepayment simulation.',
      summaryData: {
        metric: 'Loan Schedules',
        subtext: 'Accelerate mortgage prepayment & savings',
      },
      cta: 'Manage Loans',
      action: () => onNavigateToModule('emi-manager'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Centralized Summary Banner (§2.1 Profile Rollup) */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E7E5E4] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">
                Centralized Portfolio & Cash Flow Overview
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1C1917] mt-0.5">
              Welcome back, {user?.fullName || 'Alok'}
            </h2>
            <p className="text-xs text-[#78716C]">
              Consolidated financial rollup sourced from active suite modules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToModule('expense-tracker')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#342D27] rounded-lg shadow-xs transition-colors"
            >
              <Receipt className="h-3.5 w-3.5 text-[#FEF3C7]" />
              <span>Open Expense Tracker</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* 4-Metric Rollup Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <ArrowDownLeft className="h-3.5 w-3.5 text-[#B45309]" />
              <span>Monthly Inflow</span>
            </div>
            <div className="text-lg font-bold text-[#1C1917] mt-1 tabular-nums">
              <Money amount={rollupStats.monthlyInflow} />
            </div>
            <span className="text-[10px] text-[#78716C] block mt-0.5">Primary + Secondary streams</span>
          </div>

          <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#BE123C]" />
              <span>Total Outflow</span>
            </div>
            <div className="text-lg font-bold text-[#BE123C] mt-1 tabular-nums">
              <Money amount={rollupStats.monthlyOutflow} />
            </div>
            <span className="text-[10px] text-[#78716C] block mt-0.5">Committed budget burn</span>
          </div>

          <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <Clock className="h-3.5 w-3.5 text-[#B45309]" />
              <span>Pending Outflows</span>
            </div>
            <div className="text-lg font-bold text-[#B45309] mt-1 tabular-nums">
              <Money amount={rollupStats.pendingOutflow} />
            </div>
            <span className="text-[10px] text-[#78716C] block mt-0.5">Unsettled commitments</span>
          </div>

          <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1C1917]" />
              <span>Liquid Net Position</span>
            </div>
            <div className="text-lg font-bold text-[#1C1917] mt-1 tabular-nums">
              <Money amount={rollupStats.netPosition} />
            </div>
            <span className="text-[10px] text-[#78716C] block mt-0.5">Settled cash surplus</span>
          </div>
        </div>
      </div>

      {/* Top Tabs: Tools (Module Catalog) vs Suite Insights (§2.5) */}
      <div className="flex items-center gap-2 border-b border-[#E7E5E4]">
        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'tools'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Tools (Module Catalog)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'insights'
              ? 'border-[#1C1917] text-[#1C1917]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Activity className="h-4 w-4 text-[#B45309]" />
          <span>Suite-Wide Insights</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#FEF3C7] text-[#B45309] font-bold">
            Composite
          </span>
        </button>
      </div>

      {/* Tab 1: Tools / Module Grid */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULE_TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                className="bg-white p-5 rounded-xl border border-[#E7E5E4] flex flex-col justify-between space-y-4 hover:border-[#1C1917] transition-all shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] text-[#1C1917] group-hover:bg-[#1C1917] group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#78716C] bg-[#FAFAF9] px-1.5 py-0.5 rounded border border-[#E7E5E4]">
                        {tile.track}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tile.badgeColor}`}>
                        {tile.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">{tile.title}</h3>
                    <p className="text-[11px] font-semibold text-[#B45309] mt-0.5">{tile.tagline}</p>
                    <p className="text-xs text-[#78716C] mt-2 leading-relaxed">{tile.description}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#E7E5E4]">
                  <div className="p-2 bg-[#FAFAF9] rounded-md border border-[#E7E5E4]">
                    <span className="text-xs font-bold text-[#1C1917] block tabular-nums">
                      {tile.summaryData.metric}
                    </span>
                    <span className="text-[10px] text-[#78716C] block">
                      {tile.summaryData.subtext}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={tile.action}
                    className={`w-full py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      tile.status === 'Ready'
                        ? 'bg-[#1C1917] hover:bg-[#342D27] text-white shadow-xs'
                        : 'bg-[#FAFAF9] hover:bg-white text-[#1C1917] border border-[#E7E5E4]'
                    }`}
                  >
                    <span>{tile.cta}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Suite-Wide Composite Insights (§2.5) */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E7E5E4] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#B45309]" />
                  <h3 className="text-sm font-bold text-[#1C1917]">
                    Suite-Wide Financial Health Composite
                  </h3>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Cross-module score evaluating Net Worth velocity, debt ratios, and liquid cash burn.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider block">
                    Composite Score
                  </span>
                  <span className="text-2xl font-serif font-bold text-[#B45309] tabular-nums">
                    88 / 100
                  </span>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-md border bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30">
                  Excellent
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] space-y-1">
                <span className="text-xs font-semibold text-[#78716C] block">Total Liquid Cushion</span>
                <span className="text-base font-bold text-[#1C1917] block tabular-nums">
                  <Money amount={750000} />
                </span>
                <span className="text-[10px] text-[#78716C] block">8.1 Months of Outflow Runway</span>
              </div>

              <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] space-y-1">
                <span className="text-xs font-semibold text-[#78716C] block">Debt-to-Asset Ratio</span>
                <span className="text-base font-bold text-[#1C1917] block tabular-nums">8.2%</span>
                <span className="text-[10px] text-[#78716C] block">Target: &lt; 25% (Conservative)</span>
              </div>

              <div className="p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] space-y-1">
                <span className="text-xs font-semibold text-[#78716C] block">FIRE Horizon Forecast</span>
                <span className="text-base font-bold text-[#B45309] block tabular-nums">11.4 Years</span>
                <span className="text-[10px] text-[#78716C] block">Assuming 12% equity compounding</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightsCard
              type="positive"
              sourceModule="PORTFOLIO"
              title="Equity Portfolio Outperformed NIFTY 50"
              description="Your investment portfolio returned +18.4% YoY, generating a 4.2% alpha over the index benchmark."
              metric="+18.4% YoY"
            />

            <InsightsCard
              type="positive"
              sourceModule="EXPENSE"
              title="53.8% Monthly Savings Rate"
              description="Your monthly cash retention is well above the 20% benchmark, allowing consistent SIP investments."
              metric="₹1,07,500 Saved"
              action={{
                label: 'View Expense Breakdown',
                onClick: () => onNavigateToModule('expense-tracker'),
              }}
            />
          </div>

          {/* Learn Center Callout */}
          <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Educational Knowledge Hub
              </span>
              <h4 className="text-sm font-bold">Deep Dive into Finora's 8 Financial Frameworks</h4>
              <p className="text-xs text-stone-300 max-w-xl">
                Read practical formulas and rules of thumb on debt prepayment math, SWR modeling, and zero-knowledge encryption.
              </p>
            </div>

            <button
              onClick={() => onNavigateToModule('learn')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-xs"
            >
              Explore 8 Guides
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceHub;
