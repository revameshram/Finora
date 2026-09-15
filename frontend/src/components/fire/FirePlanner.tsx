import React, { useState, useEffect } from 'react';
import {
  Flame,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  HelpCircle,
  BarChart2,
  DollarSign,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

import { Money, InsightsCard, OnboardingDrawer } from '../shared';
import { FireSummaryTab } from './FireSummaryTab';

export const FirePlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INPUTS' | 'SUMMARY'>('INPUTS');
  const [activeMode, setActiveMode] = useState<'YEARS_TO_FIRE' | 'REQUIRED_SAVINGS'>('YEARS_TO_FIRE');

  // Form Parameters
  const [currentSavingsSource, setCurrentSavingsSource] = useState<'MANUAL' | 'NET_WORTH' | 'PORTFOLIO'>('MANUAL');
  const [manualCurrentSavings, setManualCurrentSavings] = useState<number | ''>(2500000);
  const [currentAge, setCurrentAge] = useState<number | ''>(32);
  const [targetRetirementAge, setTargetRetirementAge] = useState<number | ''>(45);
  const [monthlySavings, setMonthlySavings] = useState<number | ''>(60000);
  const [expectedAnnualReturnPct, setExpectedAnnualReturnPct] = useState<number>(12.0);
  const [postRetirementReturnPct, setPostRetirementReturnPct] = useState<number>(8.0);
  const [annualExpensesInRetirement, setAnnualExpensesInRetirement] = useState<number | ''>(1200000);
  const [safeWithdrawalRatePct, setSafeWithdrawalRatePct] = useState<number>(4.0);
  const [expectedAnnualInflationPct, setExpectedAnnualInflationPct] = useState<number>(6.0);
  const [notes, setNotes] = useState<string>('');

  // Backend state
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/fire/plan');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        populateFormFromPlan(data.plan);
      } else {
        seedDefaultState();
      }
    } catch (e) {
      seedDefaultState();
    } finally {
      setLoading(false);
    }
  };

  const populateFormFromPlan = (plan: any) => {
    if (!plan) return;
    setCurrentSavingsSource(plan.currentSavingsSource || 'MANUAL');
    setManualCurrentSavings(plan.manualCurrentSavings ?? 2500000);
    setCurrentAge(plan.currentAge ?? 32);
    setTargetRetirementAge(plan.targetRetirementAge ?? 45);
    setMonthlySavings(plan.monthlySavings ?? 60000);
    setExpectedAnnualReturnPct(plan.expectedAnnualReturnPct ?? 12.0);
    setPostRetirementReturnPct(plan.postRetirementReturnPct ?? 8.0);
    setAnnualExpensesInRetirement(plan.annualExpensesInRetirement ?? 1200000);
    setSafeWithdrawalRatePct(plan.safeWithdrawalRatePct ?? 4.0);
    setExpectedAnnualInflationPct(plan.expectedAnnualInflationPct ?? 6.0);
    setActiveMode(plan.activeMode || 'YEARS_TO_FIRE');
    setNotes(plan.notes || '');
  };

  const seedDefaultState = () => {
    setSummary({
      plan: {
        currentSavingsSource: 'MANUAL',
        manualCurrentSavings: 2500000,
        effectiveCurrentSavings: 2500000,
        currentAge: 32,
        targetRetirementAge: 45,
        monthlySavings: 60000,
        expectedAnnualReturnPct: 12.0,
        postRetirementReturnPct: 8.0,
        annualExpensesInRetirement: 1200000,
        safeWithdrawalRatePct: 4.0,
        swrMultiple: 25.0,
        expectedAnnualInflationPct: 6.0,
        activeMode: 'YEARS_TO_FIRE',
      },
      calculation: {
        fireNumber: 30000000,
        swrMultiple: 25.0,
        yearsToFire: 13.8,
        computedRetirementAge: 46,
        requiredMonthlySavings: 45800,
        currentProgressPercentage: 8.33,
        isInputsValid: true,
      },
      projections: Array.from({ length: 31 }, (_, i) => ({
        year: i,
        age: 32 + i,
        nominalWealth: 2500000 * Math.pow(1.12, i) + 60000 * 12 * i * Math.pow(1.06, i),
        realPurchasingPower: (2500000 * Math.pow(1.12, i)) / Math.pow(1.06, i),
        targetFireNumber: 30000000 * Math.pow(1.06, i),
        isFireReached: i >= 14,
      })),
      nudges: [
        {
          id: 'n-1',
          type: 'EXCELLENT_SAVINGS',
          severity: 'SUCCESS',
          title: 'Solid Compound Foundation',
          message: 'Your starting corpus & ₹60k monthly savings put you on track for retirement at age 46.',
          actionLabel: 'View Summary',
        },
      ],
    });
  };

  const handleUpdatePlan = async () => {
    const payload = {
      currentSavingsSource,
      manualCurrentSavings: manualCurrentSavings === '' ? 0 : Number(manualCurrentSavings),
      currentAge: currentAge === '' ? null : Number(currentAge),
      targetRetirementAge: targetRetirementAge === '' ? null : Number(targetRetirementAge),
      monthlySavings: monthlySavings === '' ? 0 : Number(monthlySavings),
      expectedAnnualReturnPct,
      postRetirementReturnPct,
      annualExpensesInRetirement: annualExpensesInRetirement === '' ? 0 : Number(annualExpensesInRetirement),
      safeWithdrawalRatePct,
      expectedAnnualInflationPct,
      activeMode,
      notes,
    };

    try {
      const res = await fetch('/api/v1/fire/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedSampleData = async () => {
    try {
      await fetch('/api/v1/fire/seed', { method: 'POST' });
      fetchSummary();
    } catch (e) {
      fetchSummary();
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B88728]" />
      </div>
    );
  }

  const { plan, calculation, projections, nudges } = summary;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[#F3F6F3]">FIRE Planner</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B88728]/20 border border-[#B88728]/40 text-[#B88728]">
              Track A
            </span>
          </div>
          <p className="text-xs text-[#8DA698] mt-1">
            Financial Independence & Early Retirement forecasting powered by the 4% Safe Withdrawal Rule & compound growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedSampleData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#8DA698] hover:text-[#F3F6F3] border border-[#2D4A3E] hover:bg-[#12241C] rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B88728]" /> Try Sample Data
          </button>
          <button
            onClick={handleUpdatePlan}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0E1B15] bg-[#B88728] hover:bg-[#d49d32] rounded-lg transition-colors shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recalculate Plan
          </button>
        </div>
      </div>

      {/* Top Mode Rail & View Switcher */}
      <div className="flex items-center justify-between border-b border-[#1E382B] pb-3">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('INPUTS')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'INPUTS' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            <Calendar className="w-4 h-4" /> Input Parameters
          </button>
          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'SUMMARY' ? 'border-[#B88728] text-[#B88728]' : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Summary & Projections Tab
          </button>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-xs">
          <button
            onClick={() => {
              setActiveMode('YEARS_TO_FIRE');
              handleUpdatePlan();
            }}
            className={`px-3 py-1 rounded font-semibold transition-all ${
              activeMode === 'YEARS_TO_FIRE' ? 'bg-[#B88728] text-[#0E1B15]' : 'text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            Mode 1: Years to FIRE
          </button>
          <button
            onClick={() => {
              setActiveMode('REQUIRED_SAVINGS');
              handleUpdatePlan();
            }}
            className={`px-3 py-1 rounded font-semibold transition-all ${
              activeMode === 'REQUIRED_SAVINGS' ? 'bg-[#B88728] text-[#0E1B15]' : 'text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            Mode 2: Required Savings
          </button>
        </div>
      </div>

      {activeTab === 'SUMMARY' ? (
        <FireSummaryTab
          fireNumber={calculation.fireNumber}
          effectiveCurrentSavings={plan.effectiveCurrentSavings}
          currentProgressPercentage={calculation.currentProgressPercentage}
          projections={projections}
          monthlySavings={plan.monthlySavings}
          expectedAnnualReturnPct={plan.expectedAnnualReturnPct}
          expectedAnnualInflationPct={plan.expectedAnnualInflationPct}
          safeWithdrawalRatePct={plan.safeWithdrawalRatePct}
        />
      ) : (
        /* TWO-COLUMN LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Input Parameters Form (2 Spans) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl space-y-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8DA698] border-b border-[#1E382B] pb-3">
                1. Starting Corpus & Source Sync
              </h3>

              <div className="space-y-4">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698]">
                  Current Savings & Investments Source
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentSavingsSource('MANUAL')}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      currentSavingsSource === 'MANUAL'
                        ? 'border-[#B88728] bg-[#B88728]/10 text-[#F3F6F3]'
                        : 'border-[#2D4A3E] bg-[#12241C] text-[#8DA698] hover:text-[#F3F6F3]'
                    }`}
                  >
                    <h4 className="text-xs font-semibold">Your Own Total</h4>
                    <p className="text-[10px] text-[#6B8576] mt-0.5">Manual ₹ override</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentSavingsSource('NET_WORTH')}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      currentSavingsSource === 'NET_WORTH'
                        ? 'border-[#B88728] bg-[#B88728]/10 text-[#F3F6F3]'
                        : 'border-[#2D4A3E] bg-[#12241C] text-[#8DA698] hover:text-[#F3F6F3]'
                    }`}
                  >
                    <h4 className="text-xs font-semibold">Net Worth Tracker</h4>
                    <p className="text-[10px] text-[#6B8576] mt-0.5">Auto-synced assets</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentSavingsSource('PORTFOLIO')}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      currentSavingsSource === 'PORTFOLIO'
                        ? 'border-[#B88728] bg-[#B88728]/10 text-[#F3F6F3]'
                        : 'border-[#2D4A3E] bg-[#12241C] text-[#8DA698] hover:text-[#F3F6F3]'
                    }`}
                  >
                    <h4 className="text-xs font-semibold">Portfolio Tracker</h4>
                    <p className="text-[10px] text-[#6B8576] mt-0.5">Auto-synced portfolio</p>
                  </button>
                </div>

                {currentSavingsSource === 'MANUAL' ? (
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                      Manual Starting Corpus (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        value={manualCurrentSavings}
                        onChange={(e) => setManualCurrentSavings(e.target.value === '' ? '' : Number(e.target.value))}
                        onBlur={handleUpdatePlan}
                        className="w-full pl-8 pr-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] font-semibold text-base focus:outline-none focus:border-[#B88728]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#12241C] border border-[#1B6B44]/40 rounded-lg flex items-center justify-between text-xs text-[#8DA698]">
                    <span>Synced Effective Starting Corpus:</span>
                    <span className="font-bold text-[#F3F6F3]"><Money amount={plan.effectiveCurrentSavings} /></span>
                  </div>
                )}
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8DA698] border-b border-[#1E382B] pt-4 pb-3">
                2. Age & Savings Parameters
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Current Age (Optional)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    placeholder="e.g. 32"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.value === '' ? '' : Number(e.target.value))}
                    onBlur={handleUpdatePlan}
                    className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                  />
                </div>

                {activeMode === 'REQUIRED_SAVINGS' && (
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                      Target Retirement Age *
                    </label>
                    <input
                      type="number"
                      min="25"
                      max="90"
                      placeholder="e.g. 45"
                      value={targetRetirementAge}
                      onChange={(e) => setTargetRetirementAge(e.target.value === '' ? '' : Number(e.target.value))}
                      onBlur={handleUpdatePlan}
                      className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                    />
                  </div>
                )}

                {activeMode === 'YEARS_TO_FIRE' && (
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                      Monthly Savings Rate (₹/mo)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="2000"
                        placeholder="e.g. 60000"
                        value={monthlySavings}
                        onChange={(e) => setMonthlySavings(e.target.value === '' ? '' : Number(e.target.value))}
                        onBlur={handleUpdatePlan}
                        className="w-full pl-8 pr-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] font-semibold focus:outline-none focus:border-[#B88728]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8DA698] border-b border-[#1E382B] pt-4 pb-3">
                3. Expenses & Return Assumptions (Standardized Finora Baseline)
              </h3>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                  Annual Expenses in Retirement (₹/yr)
                </label>
                <p className="text-[11px] text-[#6B8576] mb-2">
                  Expected annual living expenses after retirement (Auto-populated from Expense Tracker if zero).
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">₹</span>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    placeholder="e.g. 1200000"
                    value={annualExpensesInRetirement}
                    onChange={(e) => setAnnualExpensesInRetirement(e.target.value === '' ? '' : Number(e.target.value))}
                    onBlur={handleUpdatePlan}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] font-semibold text-base focus:outline-none focus:border-[#B88728]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Pre-Retirement CAGR (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    step="0.5"
                    value={expectedAnnualReturnPct}
                    onChange={(e) => setExpectedAnnualReturnPct(Number(e.target.value))}
                    onBlur={handleUpdatePlan}
                    className="w-full px-3 py-2 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-xs text-[#F3F6F3] focus:border-[#B88728]"
                  />
                  <span className="text-[10px] text-[#6B8576] mt-1 block">Default: 12.0%</span>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Safe Withdrawal Rate (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.25"
                    value={safeWithdrawalRatePct}
                    onChange={(e) => setSafeWithdrawalRatePct(Number(e.target.value))}
                    onBlur={handleUpdatePlan}
                    className="w-full px-3 py-2 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-xs text-[#F3F6F3] focus:border-[#B88728]"
                  />
                  <span className="text-[10px] text-[#6B8576] mt-1 block">Default: 4.0% (25x)</span>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Expected Inflation (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={expectedAnnualInflationPct}
                    onChange={(e) => setExpectedAnnualInflationPct(Number(e.target.value))}
                    onBlur={handleUpdatePlan}
                    className="w-full px-3 py-2 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-xs text-[#F3F6F3] focus:border-[#B88728]"
                  />
                  <span className="text-[10px] text-[#6B8576] mt-1 block">Default: 6.0% (India)</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PERSISTENT SIDEBAR (1 Span) */}
          <div className="space-y-6">
            {/* 1. FIRE Number Card */}
            <div className="p-6 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8DA698]">
                <span className="font-semibold uppercase tracking-wider">Target FIRE Number</span>
                <Flame className="w-4 h-4 text-[#B88728]" />
              </div>
              <p className="text-3xl font-bold font-serif text-[#F3F6F3]">
                <Money amount={calculation.fireNumber} />
              </p>
              <p className="text-xs text-[#8DA698] border-t border-[#1E382B] pt-2">
                {plan.safeWithdrawalRatePct}% withdrawal rate × <Money amount={plan.annualExpensesInRetirement} /> annual expenses ({calculation.swrMultiple}x multiple)
              </p>
            </div>

            {/* 2. Active Mode Result Card */}
            <div className="p-6 bg-[#12241C] border border-[#B88728]/40 rounded-xl shadow-md space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B88728]">
                {activeMode === 'YEARS_TO_FIRE' ? 'Years to FIRE Forecast' : 'Required Monthly Savings'}
              </span>

              {activeMode === 'YEARS_TO_FIRE' ? (
                <div>
                  <p className="text-3xl font-bold text-[#F3F6F3]">
                    {calculation.yearsToFire !== null ? `${calculation.yearsToFire} Years` : '—'}
                  </p>
                  {calculation.computedRetirementAge !== null && (
                    <p className="text-xs text-[#1B6B44] font-semibold mt-1">
                      Retire at Age {calculation.computedRetirementAge} 🎉
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-[#1B6B44]">
                    <Money amount={calculation.requiredMonthlySavings || 0} /><span className="text-xs text-[#8DA698] font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-[#8DA698] mt-1">
                    To retire by Age {plan.targetRetirementAge || '—'}
                  </p>
                </div>
              )}
            </div>

            {/* 3. About FIRE Card */}
            <div className="p-6 bg-[#0E1B15] border border-[#2D4A3E] rounded-xl space-y-3 text-xs text-[#8DA698]">
              <h4 className="font-semibold text-[#F3F6F3] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#B88728]" /> About FIRE & The 4% Rule
              </h4>
              <p>
                Financial Independence means having enough savings to cover living expenses without needing to work. The 4% rule suggests you can safely withdraw 4% of your portfolio annually in retirement without depleting your principal over a 30+ year horizon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
