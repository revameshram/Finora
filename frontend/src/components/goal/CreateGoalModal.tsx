import React, { useState } from 'react';
import { X, Target, ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface PortfolioAssetOption {
  id: string;
  name: string;
  assetType: string;
  value: number;
}

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioAssets?: PortfolioAssetOption[];
  initialValues?: Partial<{
    name: string;
    category: string;
    priority: string;
    targetAmount: number;
    targetIsFutureValue: boolean;
    targetDate: string;
    inflationRatePct: number;
    expectedAnnualReturnPct: number;
    contributionFrequency: string;
    startingBalance: number;
    accountLabel?: string;
    notes?: string;
  }>;
  onSave: (goalData: {
    name: string;
    category: string;
    priority: string;
    targetAmount: number;
    targetIsFutureValue: boolean;
    targetDate: string;
    inflationRatePct: number;
    expectedAnnualReturnPct: number;
    contributionFrequency: string;
    startingBalance: number;
    accountLabel?: string;
    notes?: string;
    linkedPortfolioAssetIds?: string[];
  }) => void;
}

const CATEGORIES = [
  { id: 'EMERGENCY_FUND', name: 'Emergency Fund', hint: 'Typical starting target: 6 months of living expenses (₹6,00,000)' },
  { id: 'RETIREMENT', name: 'Retirement & FIRE', hint: 'Typical target: 25x–33x annual spend (₹1,50,00,000)' },
  { id: 'HOME_DOWNPAYMENT', name: 'Home Down Payment', hint: 'Typical target: 20% property value + stamp duty (₹25,00,000)' },
  { id: 'CAR_PURCHASE', name: 'Vehicle Purchase', hint: 'Typical target: 50% auto down payment (₹5,00,000)' },
  { id: 'VACATION', name: 'Vacation & Travel', hint: 'Typical target: Annual family travel budget (₹3,50,000)' },
  { id: 'EDUCATION', name: 'Education & Upskilling', hint: 'Typical target: Higher education or tuition pool (₹10,00,000)' },
  { id: 'WEDDING', name: 'Wedding & Family Event', hint: 'Typical target: Family milestone ceremony fund (₹15,00,000)' },
  { id: 'WEALTH_BUILDING', name: 'Wealth Building', hint: 'Long-term core compounding asset pool (₹50,00,000)' },
  { id: 'OTHER', name: 'Custom Goal', hint: 'Define your own milestone' },
];

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  portfolioAssets = [],
  initialValues,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'BASICS' | 'PLAN' | 'FUNDING' | 'LINK'>('BASICS');

  // Form Fields
  const [name, setName] = useState(initialValues?.name || '');
  const [category, setCategory] = useState(initialValues?.category || 'EMERGENCY_FUND');
  const [priority, setPriority] = useState(initialValues?.priority || 'HIGH');
  const [notes, setNotes] = useState(initialValues?.notes || '');

  const [targetAmount, setTargetAmount] = useState<number | ''>(initialValues?.targetAmount ?? 600000);
  const [targetIsFutureValue, setTargetIsFutureValue] = useState(initialValues?.targetIsFutureValue ?? false);
  const [targetDate, setTargetDate] = useState(
    initialValues?.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [inflationRatePct, setInflationRatePct] = useState(initialValues?.inflationRatePct ?? 6.0);
  const [expectedAnnualReturnPct, setExpectedAnnualReturnPct] = useState(initialValues?.expectedAnnualReturnPct ?? 10.0);
  const [contributionFrequency, setContributionFrequency] = useState(initialValues?.contributionFrequency || 'MONTHLY');

  const [startingBalance, setStartingBalance] = useState<number | ''>(initialValues?.startingBalance ?? 100000);
  const [accountLabel, setAccountLabel] = useState(initialValues?.accountLabel || 'HDFC Savings & Liquid MF');

  React.useEffect(() => {
    if (initialValues && isOpen) {
      if (initialValues.name !== undefined) setName(initialValues.name);
      if (initialValues.category !== undefined) setCategory(initialValues.category);
      if (initialValues.priority !== undefined) setPriority(initialValues.priority);
      if (initialValues.targetAmount !== undefined) setTargetAmount(initialValues.targetAmount);
      if (initialValues.targetIsFutureValue !== undefined) setTargetIsFutureValue(initialValues.targetIsFutureValue);
      if (initialValues.targetDate !== undefined) setTargetDate(initialValues.targetDate);
      if (initialValues.inflationRatePct !== undefined) setInflationRatePct(initialValues.inflationRatePct);
      if (initialValues.expectedAnnualReturnPct !== undefined) setExpectedAnnualReturnPct(initialValues.expectedAnnualReturnPct);
      if (initialValues.contributionFrequency !== undefined) setContributionFrequency(initialValues.contributionFrequency);
      if (initialValues.startingBalance !== undefined) setStartingBalance(initialValues.startingBalance);
      if (initialValues.accountLabel !== undefined) setAccountLabel(initialValues.accountLabel);
      if (initialValues.notes !== undefined) setNotes(initialValues.notes);
    }
  }, [initialValues, isOpen]);

  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentCategoryObj = CATEGORIES.find((c) => c.id === category);

  const toggleAssetLink = (id: string) => {
    if (selectedAssetIds.includes(id)) {
      setSelectedAssetIds(selectedAssetIds.filter((a) => a !== id));
    } else {
      setSelectedAssetIds([...selectedAssetIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || Number(targetAmount) <= 0) return;

    onSave({
      name,
      category,
      priority,
      targetAmount: Number(targetAmount),
      targetIsFutureValue,
      targetDate,
      inflationRatePct,
      expectedAnnualReturnPct,
      contributionFrequency,
      startingBalance: startingBalance === '' ? 0 : Number(startingBalance),
      accountLabel,
      notes,
      linkedPortfolioAssetIds: selectedAssetIds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white text-[#1C1917] border border-[#E7E5E4] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7E5E4] bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B88728]/10 border border-[#B88728]/30 text-[#B88728]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#1C1917]">Create Milestone Goal</h2>
              <p className="text-xs text-[#78716C]">4-step wizard: Basics, Target & Plan, Funding & Portfolio Links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Rail */}
        <div className="grid grid-cols-4 border-b border-[#E7E5E4] bg-stone-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('BASICS')}
            className={`py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'BASICS'
                ? 'border-[#B88728] text-[#B88728] bg-white'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            1. Basics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PLAN')}
            className={`py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'PLAN'
                ? 'border-[#B88728] text-[#B88728] bg-white'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            2. Target & Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FUNDING')}
            className={`py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'FUNDING'
                ? 'border-[#B88728] text-[#B88728] bg-white'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            3. Funding
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LINK')}
            className={`py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'LINK'
                ? 'border-[#B88728] text-[#B88728] bg-white'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            4. Link Assets ({selectedAssetIds.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* TAB 1: BASICS */}
          {activeTab === 'BASICS' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6-Month Emergency Shield / Japan Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                    Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              {currentCategoryObj && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{currentCategoryObj.hint}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                  Notes / Motivation (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Why this goal matters to your financial peace of mind..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] text-xs focus:outline-none focus:border-[#B88728]"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('PLAN')}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg transition-colors shadow-xs"
                >
                  Next: Target & Plan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TARGET & PLAN */}
          {activeTab === 'PLAN' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Target Amount (₹) *
                  </label>
                  {/* Today's vs FV Toggle */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className={!targetIsFutureValue ? 'text-[#B88728] font-semibold' : 'text-[#78716C]'}>
                      Today's Money
                    </span>
                    <button
                      type="button"
                      onClick={() => setTargetIsFutureValue(!targetIsFutureValue)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        targetIsFutureValue ? 'bg-[#B88728]' : 'bg-stone-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          targetIsFutureValue ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={targetIsFutureValue ? 'text-[#B88728] font-semibold' : 'text-[#78716C]'}>
                      Future Value
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="5000"
                    placeholder="e.g. 600000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] font-semibold text-base focus:outline-none focus:border-[#B88728]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                    Contribution Frequency
                  </label>
                  <select
                    value={contributionFrequency}
                    onChange={(e) => setContributionFrequency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                  >
                    <option value="MONTHLY">Monthly SIP</option>
                    <option value="QUARTERLY">Quarterly Top-up</option>
                    <option value="ANNUALLY">Annual Bonus</option>
                    <option value="ONE_TIME">Lump Sum Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                    Inflation Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={inflationRatePct}
                    onChange={(e) => setInflationRatePct(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                    Expected Return CAGR (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={expectedAnnualReturnPct}
                    onChange={(e) => setExpectedAnnualReturnPct(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('BASICS')}
                  className="px-4 py-2 text-sm text-[#78716C] hover:text-[#1C1917]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('FUNDING')}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg transition-colors shadow-xs"
                >
                  Next: Funding <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FUNDING */}
          {activeTab === 'FUNDING' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                  Starting Balance (₹)
                </label>
                <p className="text-xs text-[#78716C] mb-3">
                  Cash or existing savings earmarked for this goal not tracked in Portfolio Tracker.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g. 100000"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] font-semibold text-base focus:outline-none focus:border-[#B88728]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                  Account Label / Bank Source
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Savings & Liquid MF"
                  value={accountLabel}
                  onChange={(e) => setAccountLabel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#B88728]"
                />
              </div>

              <div className="p-4 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#1C1917]">Already tracking investments in Portfolio Tracker?</h4>
                  <p className="text-xs text-[#78716C]">Link your stocks, MFs, or bonds to auto-sync current value.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('LINK')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#B88728] border border-[#B88728]/40 rounded-lg hover:bg-[#B88728]/10 transition-colors"
                >
                  Link Investments
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('PLAN')}
                  className="px-4 py-2 text-sm text-[#78716C] hover:text-[#1C1917]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('LINK')}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg transition-colors shadow-xs"
                >
                  Next: Link Investments <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: LINK INVESTMENTS */}
          {activeTab === 'LINK' && (
            <div className="space-y-5">
              <p className="text-xs text-[#78716C]">
                Select investments from Portfolio Tracker to automatically sync towards this goal. Each investment can only be linked to one goal per profile.
              </p>

              {portfolioAssets.length === 0 ? (
                <div className="p-6 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-center">
                  <p className="text-xs text-[#78716C] mb-1">No standalone Portfolio Tracker assets found.</p>
                  <p className="text-[11px] text-[#A8A29E]">You can complete goal setup now and link investments later.</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-[#E7E5E4] rounded-xl divide-y divide-[#E7E5E4] bg-white">
                  {portfolioAssets.map((asset) => {
                    const isSelected = selectedAssetIds.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        onClick={() => toggleAssetLink(asset.id)}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/50' : 'hover:bg-[#FAFAF9]'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-semibold text-[#1C1917]">{asset.name}</h4>
                          <span className="text-[10px] text-[#78716C] uppercase tracking-wider">{asset.assetType}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-[#1C1917]">₹{asset.value.toLocaleString()}</span>
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-[#E7E5E4]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-[#E7E5E4]">
                <button
                  type="button"
                  onClick={() => setActiveTab('FUNDING')}
                  className="px-4 py-2 text-sm text-[#78716C] hover:text-[#1C1917]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold text-white bg-[#B88728] hover:bg-[#a67520] rounded-lg transition-colors shadow-xs"
                >
                  Save Goal
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
