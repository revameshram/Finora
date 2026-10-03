import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Search,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  AssetType,
  Market,
  MfCategory,
  Capitalisation,
  DepositType,
  PaymentFrequency,
  MetalType,
  CategoryMixEntryDto,
  LivePriceQuoteDto,
  SymbolSearchResultDto,
} from '../../types/portfolio';
import { portfolioApi } from '../../services/portfolioApi';
import { Money } from '../shared';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHoldingAdded: () => void;
}

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  onHoldingAdded,
}) => {
  const [assetType, setAssetType] = useState<AssetType>('STOCK');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Price preview state
  const [livePriceQuote, setLivePriceQuote] = useState<LivePriceQuoteDto | null>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [useLivePrice, setUseLivePrice] = useState(true);

  // Symbol Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SymbolSearchResultDto[]>([]);
  const [searching, setSearching] = useState(false);

  // Stock & ETF Form
  const [ticker, setTicker] = useState('');
  const [market, setMarket] = useState<Market>('NSE');
  const [companyName, setCompanyName] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [stockCostPerUnit, setStockCostPerUnit] = useState<number | ''>('');

  // Mutual Fund Form
  const [schemeCode, setSchemeCode] = useState('');
  const [schemeName, setSchemeName] = useState('');
  const [mfCategory, setMfCategory] = useState<MfCategory>('EQUITY');
  const [mfCap, setMfCap] = useState<Capitalisation>('LARGE_CAP');
  const [mfUnits, setMfUnits] = useState<number | ''>('');
  const [mfNav, setMfNav] = useState<number | ''>('');

  // NPS Form
  const [npsPfm, setNpsPfm] = useState('HDFC Pension Management');
  const [npsPran, setNpsPran] = useState('');
  const [npsUnits, setNpsUnits] = useState<number | ''>('');
  const [npsNav, setNpsNav] = useState<number | ''>('');
  const [npsEquityPct, setNpsEquityPct] = useState<number>(75);
  const [npsCorpDebtPct, setNpsCorpDebtPct] = useState<number>(15);
  const [npsGsecPct, setNpsGsecPct] = useState<number>(10);

  // Deposit Form
  const [depBankName, setDepBankName] = useState('HDFC Bank');
  const [depType, setDepType] = useState<DepositType>('FD');
  const [depPrincipal, setDepPrincipal] = useState<number | ''>('');
  const [depRate, setDepRate] = useState<number | ''>(7.25);
  const [depStartDate, setDepStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [depMaturityDate, setDepMaturityDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [depCompounding, setDepCompounding] = useState<PaymentFrequency>('QUARTERLY');

  // Bond Form
  const [bondName, setBondName] = useState('7.75% REC Limited Bond 2030');
  const [bondIssuer, setBondIssuer] = useState('REC Limited');
  const [bondFaceValue, setBondFaceValue] = useState<number | ''>(10000);
  const [bondCouponRate, setBondCouponRate] = useState<number | ''>(7.75);
  const [bondCouponFreq, setBondCouponFreq] = useState<PaymentFrequency>('SEMI_ANNUALLY');
  const [bondIssueDate, setBondIssueDate] = useState('2025-01-01');
  const [bondMaturityDate, setBondMaturityDate] = useState('2030-01-01');
  const [bondPurchasePrice, setBondPurchasePrice] = useState<number | ''>(10000);

  // Metal Form
  const [metalType, setMetalType] = useState<MetalType>('GOLD');
  const [metalPurity, setMetalPurity] = useState<number>(24);
  const [metalGrams, setMetalGrams] = useState<number | ''>('');
  const [metalCostPerGram, setMetalCostPerGram] = useState<number | ''>('');

  // Real Estate Form
  const [reName, setReName] = useState('Whitefield 3BHK Apartment');
  const [rePropType, setRePropType] = useState('Residential Apartment');
  const [reLocation, setReLocation] = useState('Bengaluru, Karnataka');
  const [rePurchasePrice, setRePurchasePrice] = useState<number | ''>('');
  const [reCurrentValue, setReCurrentValue] = useState<number | ''>('');
  const [reNotes, setReNotes] = useState('');

  // Other Instruments Form
  const [otherName, setOtherName] = useState('Angel Startup Investment');
  const [otherCategory, setOtherCategory] = useState('Venture / Private Equity');
  const [otherInvested, setOtherInvested] = useState<number | ''>('');
  const [otherCurrentVal, setOtherCurrentVal] = useState<number | ''>('');
  const [otherMix, setOtherMix] = useState<CategoryMixEntryDto[]>([
    { bucket: 'Equity', percentage: 80 },
    { bucket: 'Alternative', percentage: 20 },
  ]);

  // Debounced search for symbols
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await portfolioApi.searchSymbols(assetType, searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Failed to search symbols:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, assetType]);

  // Fetch Live Price on symbol/metal change
  useEffect(() => {
    const symbolToFetch =
      assetType === 'STOCK' || assetType === 'ETF'
        ? ticker
        : assetType === 'MUTUAL_FUND'
        ? schemeCode
        : assetType === 'METAL'
        ? metalType
        : '';

    if (!symbolToFetch) {
      setLivePriceQuote(null);
      return;
    }

    const fetchPrice = async () => {
      setFetchingPrice(true);
      try {
        const quote = await portfolioApi.getLivePricePreview(assetType, symbolToFetch, market);
        setLivePriceQuote(quote);
      } catch (err) {
        console.error('Failed to fetch live price preview:', err);
        setLivePriceQuote(null);
      } finally {
        setFetchingPrice(false);
      }
    };

    fetchPrice();
  }, [ticker, schemeCode, metalType, assetType, market]);

  if (!isOpen) return null;

  const handleSelectSymbol = (item: SymbolSearchResultDto) => {
    setTicker(item.ticker);
    setCompanyName(item.companyName);
    setMarket((item.market as Market) || 'NSE');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSaveHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (assetType === 'STOCK') {
        if (!ticker || !stockQuantity) throw new Error('Please specify ticker and quantity');
        await portfolioApi.createStock({
          ticker: ticker.toUpperCase(),
          market,
          companyName: companyName || ticker.toUpperCase(),
          quantity: Number(stockQuantity),
          costPerUnit: useLivePrice ? undefined : Number(stockCostPerUnit),
          useLivePriceAsPurchasePrice: useLivePrice,
        });
      } else if (assetType === 'ETF') {
        if (!ticker || !stockQuantity) throw new Error('Please specify ETF ticker and quantity');
        await portfolioApi.createEtf({
          ticker: ticker.toUpperCase(),
          market,
          name: companyName || ticker.toUpperCase(),
          quantity: Number(stockQuantity),
          costPerUnit: useLivePrice ? undefined : Number(stockCostPerUnit),
          useLivePriceAsPurchasePrice: useLivePrice,
        });
      } else if (assetType === 'MUTUAL_FUND') {
        if (!schemeCode || !mfUnits) throw new Error('Please enter scheme code and units');
        await portfolioApi.createMutualFund({
          schemeCode,
          schemeName: schemeName || `Mutual Fund (${schemeCode})`,
          category: mfCategory,
          capitalisation: mfCap,
          units: Number(mfUnits),
          navPerUnit: useLivePrice ? undefined : Number(mfNav),
          useLivePriceAsPurchasePrice: useLivePrice,
        });
      } else if (assetType === 'NPS') {
        if (!npsUnits || !npsNav) throw new Error('Please enter NPS units and average NAV');
        const sumPct = npsEquityPct + npsCorpDebtPct + npsGsecPct;
        if (sumPct !== 100) throw new Error(`NPS asset allocation split must equal 100% (currently ${sumPct}%)`);
        await portfolioApi.createNps({
          pensionFundManager: npsPfm,
          pran: npsPran,
          units: Number(npsUnits),
          avgNav: Number(npsNav),
          currentNav: Number(npsNav),
          equityPct: npsEquityPct,
          corporateDebtPct: npsCorpDebtPct,
          governmentSecuritiesPct: npsGsecPct,
        });
      } else if (assetType === 'DEPOSIT') {
        if (!depPrincipal || !depRate) throw new Error('Please enter deposit principal and rate');
        await portfolioApi.createDeposit({
          bankName: depBankName,
          depositType: depType,
          principalAmount: Number(depPrincipal),
          interestRatePct: Number(depRate),
          startDate: depStartDate,
          maturityDate: depMaturityDate,
          compoundingFrequency: depCompounding,
        });
      } else if (assetType === 'BOND') {
        if (!bondPurchasePrice || !bondCouponRate) throw new Error('Please enter bond price and coupon');
        await portfolioApi.createBond({
          name: bondName,
          issuer: bondIssuer,
          faceValue: Number(bondFaceValue || 10000),
          couponRatePct: Number(bondCouponRate),
          couponFrequency: bondCouponFreq,
          issueDate: bondIssueDate,
          maturityDate: bondMaturityDate,
          purchasePrice: Number(bondPurchasePrice),
        });
      } else if (assetType === 'METAL') {
        if (!metalGrams) throw new Error('Please enter quantity in grams');
        await portfolioApi.createMetal({
          metalType,
          purityKarat: metalType === 'GOLD' ? metalPurity : undefined,
          quantityGrams: Number(metalGrams),
          costPerGram: useLivePrice ? undefined : Number(metalCostPerGram),
          useLivePriceAsPurchasePrice: useLivePrice,
        });
      } else if (assetType === 'REAL_ESTATE') {
        if (!rePurchasePrice) throw new Error('Please enter purchase price');
        await portfolioApi.createRealEstate({
          name: reName,
          propertyType: rePropType,
          location: reLocation,
          purchasePrice: Number(rePurchasePrice),
          currentEstimatedValue: Number(reCurrentValue || rePurchasePrice),
          notes: reNotes,
        });
      } else if (assetType === 'OTHER') {
        if (!otherInvested) throw new Error('Please enter invested amount');
        const mixSum = otherMix.reduce((acc, m) => acc + Number(m.percentage), 0);
        if (Math.abs(mixSum - 100) > 0.01) throw new Error(`Category mix must sum to 100% (currently ${mixSum}%)`);
        await portfolioApi.createOtherInstrument({
          name: otherName,
          category: otherCategory,
          investedAmount: Number(otherInvested),
          currentValue: Number(otherCurrentVal || otherInvested),
          categoryMix: otherMix,
        });
      }

      onHoldingAdded();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save portfolio holding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E7E5E4] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FAF2E8] border border-[#C27D38]/30 text-[#C27D38]">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">Add Portfolio Holding</h3>
              <p className="text-[11px] text-[#78716C]">
                Select an asset class to track live valuations and computed growth
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Asset Class Selector Strip */}
        <div className="p-4 border-b border-[#E7E5E4] bg-stone-50/50 flex flex-wrap gap-1.5">
          {[
            { id: 'STOCK', label: 'Stocks' },
            { id: 'ETF', label: 'ETFs' },
            { id: 'MUTUAL_FUND', label: 'Mutual Funds' },
            { id: 'NPS', label: 'NPS / UPS' },
            { id: 'DEPOSIT', label: 'FD / RD' },
            { id: 'BOND', label: 'Bonds' },
            { id: 'METAL', label: 'Gold & Bullion' },
            { id: 'REAL_ESTATE', label: 'Real Estate' },
            { id: 'OTHER', label: 'Others' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setAssetType(tab.id as AssetType);
                setLivePriceQuote(null);
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                assetType === tab.id
                  ? 'bg-[#B88728] text-white border-[#B88728] shadow-xs'
                  : 'bg-white text-[#78716C] border-[#E7E5E4] hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSaveHolding} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STOCKS & ETFS */}
          {/* ------------------------------------------------------------- */}
          {(assetType === 'STOCK' || assetType === 'ETF') && (
            <div className="space-y-4">
              {/* Symbol Autocomplete Search */}
              <div className="relative">
                <label className="block text-xs font-bold text-[#1C1917] mb-1">
                  Search Symbol or Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. RELIANCE, TCS, INFY, AAPL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 pl-9 text-xs rounded-lg border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                  />
                  {searching ? (
                    <div className="h-4 w-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin absolute left-3 top-2.5" />
                  ) : (
                    <Search className="h-4 w-4 text-[#78716C] absolute left-3 top-2.5" />
                  )}
                </div>

                {/* Dropdown search results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl border border-[#E7E5E4] shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item.ticker}
                        type="button"
                        onClick={() => handleSelectSymbol(item)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF2E8] border-b border-[#E7E5E4] last:border-0 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-[#1C1917]">{item.ticker}</span>
                          <span className="text-[11px] text-[#78716C] ml-2">{item.companyName}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                          {item.market}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ticker, Market & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Ticker Symbol <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RELIANCE"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] uppercase font-bold text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Market</label>
                  <select
                    value={market}
                    onChange={(e) => setMarket(e.target.value as Market)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white"
                  >
                    <option value="NSE">NSE (India)</option>
                    <option value="BSE">BSE (India)</option>
                    <option value="US">US Market (NASDAQ/NYSE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Company / Holding Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Reliance Industries Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              {/* Live Price Preview Callout */}
              {ticker && (
                <div className="p-3 bg-[#FAF2E8] border border-[#C27D38]/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#C27D38]" />
                    <div>
                      <span className="text-[11px] font-bold text-[#1C1917]">
                        Live Market Price: {ticker} ({market})
                      </span>
                      {livePriceQuote && (
                        <div className="text-[10px] text-[#78716C]">
                          Source: {livePriceQuote.source} · {livePriceQuote.asOf}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {fetchingPrice ? (
                      <span className="text-xs text-[#78716C] animate-pulse">Fetching quote...</span>
                    ) : livePriceQuote ? (
                      <span className="text-sm font-bold text-[#1C1917] tabular-nums">
                        <Money amount={livePriceQuote.price} />
                      </span>
                    ) : (
                      <span className="text-xs text-[#78716C]">Offline mode</span>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity and Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Quantity <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    required
                    placeholder="e.g. 15"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Purchase Price per Unit (₹)</label>
                  <input
                    type="number"
                    step="any"
                    disabled={useLivePrice}
                    placeholder={livePriceQuote ? `₹${livePriceQuote.price}` : 'e.g. 2450.00'}
                    value={useLivePrice ? (livePriceQuote?.price || '') : stockCostPerUnit}
                    onChange={(e) => setStockCostPerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] ${
                      useLivePrice ? 'bg-stone-100 text-[#78716C]' : 'bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Locked-in "Use Live Price" checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1C1917] p-2.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
                <input
                  type="checkbox"
                  checked={useLivePrice}
                  onChange={(e) => setUseLivePrice(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-[#B45309] focus:ring-[#B45309]"
                />
                <span>Use live market price as purchase price (Locked-in Convention)</span>
              </label>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* MUTUAL FUNDS */}
          {/* ------------------------------------------------------------- */}
          {assetType === 'MUTUAL_FUND' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    AMFI Scheme Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 119551 (Axis Bluechip Direct Growth)"
                    value={schemeCode}
                    onChange={(e) => setSchemeCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Scheme Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Axis Bluechip Fund - Direct Plan"
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Category</label>
                  <select
                    value={mfCategory}
                    onChange={(e) => setMfCategory(e.target.value as MfCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white"
                  >
                    <option value="EQUITY">Equity Fund</option>
                    <option value="DEBT">Debt Fund</option>
                    <option value="HYBRID">Hybrid Fund</option>
                    <option value="OTHER">Other / Solution Oriented</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Capitalisation</label>
                  <select
                    value={mfCap}
                    onChange={(e) => setMfCap(e.target.value as Capitalisation)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white"
                  >
                    <option value="LARGE_CAP">Large Cap</option>
                    <option value="MID_CAP">Mid Cap</option>
                    <option value="SMALL_CAP">Small Cap</option>
                    <option value="FLEXI_CAP">Flexi Cap / Multi Cap</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Units Held <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    required
                    placeholder="e.g. 250.45"
                    value={mfUnits}
                    onChange={(e) => setMfUnits(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Purchase NAV (₹)</label>
                  <input
                    type="number"
                    step="any"
                    disabled={useLivePrice}
                    placeholder={livePriceQuote ? `₹${livePriceQuote.price}` : 'e.g. 55.40'}
                    value={useLivePrice ? (livePriceQuote?.price || '') : mfNav}
                    onChange={(e) => setMfNav(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] ${
                      useLivePrice ? 'bg-stone-100 text-[#78716C]' : 'bg-white'
                    }`}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1C1917] p-2.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
                <input
                  type="checkbox"
                  checked={useLivePrice}
                  onChange={(e) => setUseLivePrice(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-[#B45309] focus:ring-[#B45309]"
                />
                <span>Use live AMFI published NAV as purchase price</span>
              </label>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* NPS / UPS */}
          {/* ------------------------------------------------------------- */}
          {assetType === 'NPS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Pension Fund Manager</label>
                  <input
                    type="text"
                    value={npsPfm}
                    onChange={(e) => setNpsPfm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">PRAN Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="12-digit PRAN"
                    value={npsPran}
                    onChange={(e) => setNpsPran(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Units <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1000"
                    value={npsUnits}
                    onChange={(e) => setNpsUnits(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Average NAV (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 42.50"
                    value={npsNav}
                    onChange={(e) => setNpsNav(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-2">
                <label className="block text-xs font-bold text-[#1C1917]">
                  Asset Allocation % Split (Must sum to 100%)
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#78716C] block">Equity (E) %</span>
                    <input
                      type="number"
                      value={npsEquityPct}
                      onChange={(e) => setNpsEquityPct(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-[#E7E5E4]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#78716C] block">Corp Debt (C) %</span>
                    <input
                      type="number"
                      value={npsCorpDebtPct}
                      onChange={(e) => setNpsCorpDebtPct(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-[#E7E5E4]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#78716C] block">G-Sec (G) %</span>
                    <input
                      type="number"
                      value={npsGsecPct}
                      onChange={(e) => setNpsGsecPct(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-[#E7E5E4]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* DEPOSITS (FD / RD) */}
          {/* ------------------------------------------------------------- */}
          {assetType === 'DEPOSIT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Bank / Institution</label>
                  <input
                    type="text"
                    required
                    value={depBankName}
                    onChange={(e) => setDepBankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Deposit Type</label>
                  <select
                    value={depType}
                    onChange={(e) => setDepType(e.target.value as DepositType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white"
                  >
                    <option value="FD">Fixed Deposit (FD)</option>
                    <option value="RD">Recurring Deposit (RD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Principal Amount (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 200000"
                    value={depPrincipal}
                    onChange={(e) => setDepPrincipal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 7.25"
                    value={depRate}
                    onChange={(e) => setDepRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={depStartDate}
                    onChange={(e) => setDepStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Maturity Date</label>
                  <input
                    type="date"
                    required
                    value={depMaturityDate}
                    onChange={(e) => setDepMaturityDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Compounding</label>
                  <select
                    value={depCompounding}
                    onChange={(e) => setDepCompounding(e.target.value as PaymentFrequency)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white"
                  >
                    <option value="QUARTERLY">Quarterly (Standard)</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="SEMI_ANNUALLY">Semi-Annually</option>
                    <option value="ANNUALLY">Annually</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* BONDS */}
          {/* ------------------------------------------------------------- */}
          {assetType === 'BOND' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Bond / Instrument Name</label>
                  <input
                    type="text"
                    required
                    value={bondName}
                    onChange={(e) => setBondName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Issuer Name</label>
                  <input
                    type="text"
                    required
                    value={bondIssuer}
                    onChange={(e) => setBondIssuer(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Face Value (₹)</label>
                  <input
                    type="number"
                    value={bondFaceValue}
                    onChange={(e) => setBondFaceValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Coupon Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="any"
                    value={bondCouponRate}
                    onChange={(e) => setBondCouponRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Coupon Frequency</label>
                  <select
                    value={bondCouponFreq}
                    onChange={(e) => setBondCouponFreq(e.target.value as PaymentFrequency)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white"
                  >
                    <option value="SEMI_ANNUALLY">Semi-Annually</option>
                    <option value="ANNUALLY">Annually</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={bondIssueDate}
                    onChange={(e) => setBondIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Maturity Date</label>
                  <input
                    type="date"
                    value={bondMaturityDate}
                    onChange={(e) => setBondMaturityDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={bondPurchasePrice}
                    onChange={(e) => setBondPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* METALS & BULLION */}
          {/* ------------------------------------------------------------- */}
          {assetType === 'METAL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Precious Metal</label>
                  <select
                    value={metalType}
                    onChange={(e) => setMetalType(e.target.value as MetalType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white"
                  >
                    <option value="GOLD">Gold (24K / 22K)</option>
                    <option value="SILVER">Silver</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>

                {metalType === 'GOLD' && (
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">Purity (Karat)</label>
                    <select
                      value={metalPurity}
                      onChange={(e) => setMetalPurity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-white"
                    >
                      <option value={24}>24 Karat (99.9% Fine Gold)</option>
                      <option value={22}>22 Karat (Jewellery Standard)</option>
                      <option value={18}>18 Karat</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Live Metal Price Quote */}
              <div className="p-3 bg-[#FAF2E8] border border-[#C27D38]/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#C27D38]" />
                  <div>
                    <span className="text-[11px] font-bold text-[#1C1917]">
                      Live Bullion Rate: {metalType} {metalType === 'GOLD' ? `(${metalPurity}K)` : ''}
                    </span>
                    {livePriceQuote && (
                      <div className="text-[10px] text-[#78716C]">
                        Source: {livePriceQuote.source} · {livePriceQuote.asOf}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right font-bold text-[#1C1917] tabular-nums">
                  {fetchingPrice ? (
                    <span className="text-xs text-[#78716C] animate-pulse">Fetching rate...</span>
                  ) : livePriceQuote ? (
                    <span>
                      <Money amount={livePriceQuote.price} /> / gram
                    </span>
                  ) : (
                    <span>₹6,850.00 / g</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Weight in Grams (g) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 20"
                    value={metalGrams}
                    onChange={(e) => setMetalGrams(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Purchase Cost per Gram (₹)</label>
                  <input
                    type="number"
                    step="any"
                    disabled={useLivePrice}
                    placeholder={livePriceQuote ? `₹${livePriceQuote.price}` : 'e.g. 6200'}
                    value={useLivePrice ? (livePriceQuote?.price || '') : metalCostPerGram}
                    onChange={(e) => setMetalCostPerGram(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] ${
                      useLivePrice ? 'bg-stone-100 text-[#78716C]' : 'bg-white'
                    }`}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1C1917] p-2.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
                <input
                  type="checkbox"
                  checked={useLivePrice}
                  onChange={(e) => setUseLivePrice(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-[#B45309] focus:ring-[#B45309]"
                />
                <span>Use live bullion rate as purchase cost</span>
              </label>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* REAL ESTATE */}
          {/* ------------------------------------------------------------- */}
          {assetType === 'REAL_ESTATE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Property Name / Description</label>
                  <input
                    type="text"
                    required
                    value={reName}
                    onChange={(e) => setReName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Property Type</label>
                  <input
                    type="text"
                    value={rePropType}
                    onChange={(e) => setRePropType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Location</label>
                <input
                  type="text"
                  value={reLocation}
                  onChange={(e) => setReLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Purchase Price (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 7500000"
                    value={rePurchasePrice}
                    onChange={(e) => setRePurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Current Estimated Value (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 9500000"
                    value={reCurrentValue}
                    onChange={(e) => setReCurrentValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Notes / Valuation Basis</label>
                <input
                  type="text"
                  placeholder="e.g. Rented @ ₹45k/mo, registrar guidance value"
                  value={reNotes}
                  onChange={(e) => setReNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                />
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* OTHERS */}
          {/* ------------------------------------------------------------- */}
          {assetType === 'OTHER' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Category</label>
                  <input
                    type="text"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Invested Amount (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={otherInvested}
                    onChange={(e) => setOtherInvested(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">Current Value (₹)</label>
                  <input
                    type="number"
                    value={otherCurrentVal}
                    onChange={(e) => setOtherCurrentVal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E5E4]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#FAFAF9] rounded-xl border border-[#E7E5E4] space-y-2">
                <label className="block text-xs font-bold text-[#1C1917]">
                  Category Mix Split % (Sum must equal 100%)
                </label>
                {otherMix.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.bucket}
                      onChange={(e) => {
                        const copy = [...otherMix];
                        copy[idx].bucket = e.target.value;
                        setOtherMix(copy);
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded border border-[#E7E5E4]"
                      placeholder="Bucket (e.g. Equity, Debt)"
                    />
                    <input
                      type="number"
                      value={m.percentage}
                      onChange={(e) => {
                        const copy = [...otherMix];
                        copy[idx].percentage = Number(e.target.value);
                        setOtherMix(copy);
                      }}
                      className="w-20 px-2 py-1 text-xs rounded border border-[#E7E5E4]"
                      placeholder="%"
                    />
                    <span className="text-xs text-[#78716C]">%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#E7E5E4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#B88728] hover:bg-[#a67520] disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{loading ? 'Adding Holding...' : 'Save Holding'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
