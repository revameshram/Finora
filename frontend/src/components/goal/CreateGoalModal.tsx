import React, { useState } from 'react';
import { X, Target, Calendar, TrendingUp, ShieldCheck, DollarSign, ArrowRight, Check } from 'lucide-react';

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
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'BASICS' | 'PLAN' | 'FUNDING' | 'LINK' | 'BASICS'>('BASICS');

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('EMERGENCY_FUND');
  const [priority, setPriority] = useState('HIGH');
  const [notes, setNotes] = useState('');

  const [targetAmount, setTargetAmount] = useState<number | ''>(600000);
  const [targetIsFutureValue, setTargetIsFutureValue] = useState(false);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [inflationRatePct, setInflationRatePct] = useState(6.0);
  const [expectedAnnualReturnPct, setExpectedAnnualReturnPct] = useState(10.0);
  const [contributionFrequency, setContributionFrequency] = useState('MONTHLY');

  const [startingBalance, setStartingBalance] = useState<number | ''>(100000);
  const [accountLabel, setAccountLabel] = useState('HDFC Savings & Liquid MF');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0E1B15] text-[#F3F6F3] border border-[#2D4A3E] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E382B] bg-[#12241C]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#B88728]/10 border border-[#B88728]/30 text-[#B88728]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F3F6F3]">Create Milestone Goal</h2>
              <p className="text-xs text-[#8DA698]">4-step wizard: Basics, Target & Plan, Funding & Portfolio Links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8DA698] hover:text-[#F3F6F3] hover:bg-[#1E382B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Rail */}
        <div className="grid grid-cols-4 border-b border-[#1E382B] bg-[#0A1410]">
          <button
            type="button"
            onClick={() => setActiveTab('BASICS')}
            className={`py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'BASICS'
                ? 'border-[#B88728] text-[#B88728] bg-[#12241C]'
                : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            1. Basics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PLAN')}
            className={`py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'PLAN'
                ? 'border-[#B88728] text-[#B88728] bg-[#12241C]'
                : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            2. Target & Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FUNDING')}
            className={`py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'FUNDING'
                ? 'border-[#B88728] text-[#B88728] bg-[#12241C]'
                : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            3. Funding
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LINK')}
            className={`py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'LINK'
                ? 'border-[#B88728] text-[#B88728] bg-[#12241C]'
                : 'border-transparent text-[#8DA698] hover:text-[#F3F6F3]'
            }`}
          >
            4. Link Investments ({selectedAssetIds.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* TAB 1: BASICS */}
          {activeTab === 'BASICS' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6-Month Emergency Shield / Japan Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              {currentCategoryObj && (
                <div className="p-3 bg-[#12241C] border border-[#1B6B44]/40 rounded-lg text-xs text-[#8DA698] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B6B44] shrink-0" />
                  <span>{currentCategoryObj.hint}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                  Notes / Motivation (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Why this goal matters to your financial peace of mind..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] text-xs focus:outline-none focus:border-[#B88728]"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('PLAN')}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#0E1B15] bg-[#B88728] hover:bg-[#d49d32] rounded-lg transition-colors"
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
                  <label className="text-xs font-medium uppercase tracking-wider text-[#8DA698]">
                    Target Amount (₹) *
                  </label>
                  {/* Today's vs FV Toggle */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className={!targetIsFutureValue ? 'text-[#B88728] font-medium' : 'text-[#6B8576]'}>
                      Today's Money
                    </span>
                    <button
                      type="button"
                      onClick={() => setTargetIsFutureValue(!targetIsFutureValue)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        targetIsFutureValue ? 'bg-[#B88728]' : 'bg-[#2D4A3E]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-[#F3F6F3] transition-transform ${
                          targetIsFutureValue ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={targetIsFutureValue ? 'text-[#B88728] font-medium' : 'text-[#6B8576]'}>
                      Future Value
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="5000"
                    placeholder="e.g. 600000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] font-semibold text-base focus:outline-none focus:border-[#B88728]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Contribution Frequency
                  </label>
                  <select
                    value={contributionFrequency}
                    onChange={(e) => setContributionFrequency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
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
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Inflation Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={inflationRatePct}
                    onChange={(e) => setInflationRatePct(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                    Expected Return CAGR (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={expectedAnnualReturnPct}
                    onChange={(e) => setExpectedAnnualReturnPct(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('BASICS')}
                  className="px-4 py-2 text-sm text-[#8DA698] hover:text-[#F3F6F3]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('FUNDING')}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#0E1B15] bg-[#B88728] hover:bg-[#d49d32] rounded-lg transition-colors"
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
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                  Starting Balance (₹)
                </label>
                <p className="text-xs text-[#6B8576] mb-3">
                  Cash or existing savings earmarked for this goal not tracked in Portfolio Tracker.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA698] text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g. 100000"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] font-semibold text-base focus:outline-none focus:border-[#B88728]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#8DA698] mb-2">
                  Account Label / Bank Source
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Savings & Liquid MF"
                  value={accountLabel}
                  onChange={(e) => setAccountLabel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12241C] border border-[#2D4A3E] rounded-lg text-[#F3F6F3] focus:outline-none focus:border-[#B88728]"
                />
              </div>

              <div className="p-4 bg-[#12241C] border border-[#2D4A3E] rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#F3F6F3]">Already tracking investments in Portfolio Tracker?</h4>
                  <p className="text-xs text-[#8DA698]">Link your stocks, MFs, or bonds to auto-sync current value.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('LINK')}
                  className="px-3 py-1.5 text-xs font-medium text-[#B88728] border border-[#B88728]/40 rounded hover:bg-[#B88728]/10 transition-colors"
                >
                  Link Investments
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('PLAN')}
                  className="px-4 py-2 text-sm text-[#8DA698] hover:text-[#F3F6F3]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('LINK')}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#0E1B15] bg-[#B88728] hover:bg-[#d49d32] rounded-lg transition-colors"
                >
                  Next: Link Investments <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: LINK INVESTMENTS */}
          {activeTab === 'LINK' && (
            <div className="space-y-5">
              <p className="text-xs text-[#8DA698]">
                Select investments from Portfolio Tracker to automatically sync towards this goal. Each investment can only be linked to one goal per profile.
              </p>

              {portfolioAssets.length === 0 ? (
                <div className="p-6 bg-[#12241C] border border-[#1E382B] rounded-lg text-center">
                  <p className="text-xs text-[#8DA698] mb-2">No Portfolio Tracker assets found.</p>
                  <p className="text-[11px] text-[#6B8576]">You can complete goal setup now and link investments later.</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-[#1E382B] rounded-lg divide-y divide-[#1E382B] bg-[#12241C]">
                  {portfolioAssets.map((asset) => {
                    const isSelected = selectedAssetIds.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        onClick={() => toggleAssetLink(asset.id)}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#1B6B44]/20' : 'hover:bg-[#1A3327]'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-semibold text-[#F3F6F3]">{asset.name}</h4>
                          <span className="text-[10px] text-[#8DA698] uppercase tracking-wider">{asset.assetType}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-[#F3F6F3]">₹{asset.value.toLocaleString()}</span>
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[#1B6B44] border-[#1B6B44] text-[#F3F6F3]' : 'border-[#2D4A3E]'
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

              <div className="flex justify-between pt-4 border-t border-[#1E382B]">
                <button
                  type="button"
                  onClick={() => setActiveTab('FUNDING')}
                  className="px-4 py-2 text-sm text-[#8DA698] hover:text-[#F3F6F3]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold text-[#0E1B15] bg-[#B88728] hover:bg-[#d49d32] rounded-lg transition-colors shadow-md"
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
