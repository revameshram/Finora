export type AssetType =
  | 'STOCK'
  | 'ETF'
  | 'MUTUAL_FUND'
  | 'NPS'
  | 'DEPOSIT'
  | 'BOND'
  | 'METAL'
  | 'REAL_ESTATE'
  | 'OTHER';

export type Market = 'NSE' | 'BSE' | 'US';

export type MfCategory = 'EQUITY' | 'DEBT' | 'HYBRID' | 'OTHER';

export type Capitalisation = 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'MULTI_CAP' | 'FLEXI_CAP' | 'OTHER';

export type DepositType = 'FD' | 'RD' | 'FIXED_DEPOSIT' | 'RECURRING_DEPOSIT';

export type PaymentFrequency = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';

export type BondStatus = 'ACTIVE' | 'MATURED' | 'DEFAULTED';

export type MetalType = 'GOLD' | 'SILVER' | 'PLATINUM';

export interface CategoryMixEntryDto {
  bucket: string;
  percentage: number;
}

// ---------------------------------------------------------------------------
// Holding DTOs
// ---------------------------------------------------------------------------

export interface StockHoldingDto {
  id: string;
  name?: string;
  companyName?: string;
  ticker: string;
  market: Market;
  quantity: number;
  avgCostPerUnit: number;
  investedAmount: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
  isLive: boolean;
  livePriceAsOf?: string;
  isIncluded?: boolean;
  createdAt: string;
}

export interface EtfHoldingDto {
  id: string;
  name: string;
  ticker: string;
  market: Market;
  quantity: number;
  avgCostPerUnit: number;
  investedAmount: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
  isLive: boolean;
  livePriceAsOf?: string;
  isIncluded?: boolean;
  createdAt: string;
}

export interface MutualFundHoldingDto {
  id: string;
  schemeCode: string;
  schemeName: string;
  category: MfCategory;
  capitalisation?: Capitalisation;
  units: number;
  avgNav: number;
  investedAmount: number;
  currentNav: number;
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
  isLive: boolean;
  livePriceAsOf?: string;
  isIncluded?: boolean;
  createdAt: string;
}

export interface NpsHoldingDto {
  id: string;
  pensionFundManager: string;
  pran?: string;
  units: number;
  avgNav: number;
  investedAmount: number;
  currentNav: number;
  currentValue: number;
  equityPct: number;
  corporateDebtPct: number;
  governmentSecuritiesPct: number;
  alternativePct?: number;
  gainLoss: number;
  gainLossPct: number;
  isIncluded?: boolean;
  createdAt: string;
}

export interface DepositScheduleEntryDto {
  date: string;
  deposit: number;
  earnedInterest: number;
  capital: number;
  status: string;
}

export interface DepositDto {
  id: string;
  bankName: string;
  accountNumber?: string;
  depositType: DepositType;
  principalAmount: number;
  interestRatePct: number;
  startDate: string;
  maturityDate: string;
  compoundingFrequency: PaymentFrequency;
  maturityValue?: number;
  maturityAmount?: number;
  currentValue?: number;
  currentEstimatedValue?: number;
  isIncluded?: boolean;
  createdAt: string;
}

export interface BondScheduleEntryDto {
  date: string;
  coupon: number;
  capital: number;
  payout: number;
  status: string;
}

export interface BondDto {
  id: string;
  name: string;
  issuer: string;
  faceValue: number;
  couponRatePct: number;
  couponFrequency: PaymentFrequency;
  issueDate: string;
  maturityDate: string;
  purchasePrice: number;
  currentPrice?: number;
  status: BondStatus;
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
  isIncluded?: boolean;
  createdAt: string;
}

export interface MetalHoldingDto {
  id: string;
  metalType: MetalType;
  purityKarat?: number;
  quantityGrams: number;
  avgCostPerGram: number;
  investedAmount: number;
  currentPricePerGram: number;
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
  isLive: boolean;
  livePriceAsOf?: string;
  isIncluded?: boolean;
  createdAt: string;
}

export interface RealEstateDto {
  id: string;
  name: string;
  propertyType: string;
  location?: string;
  purchasePrice: number;
  purchaseDate?: string;
  currentEstimatedValue: number;
  notes?: string;
  gainLoss: number;
  gainLossPct: number;
  isIncluded?: boolean;
  createdAt: string;
}

export interface OtherInstrumentDto {
  id: string;
  name: string;
  category: string;
  investedAmount: number;
  currentValue: number;
  notes?: string;
  gainLoss: number;
  gainLossPct: number;
  categoryMix: CategoryMixEntryDto[];
  isIncluded?: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Create & Update Requests
// ---------------------------------------------------------------------------

export interface CreateStockHoldingRequest {
  ticker: string;
  market?: Market;
  companyName?: string;
  quantity: number;
  costPerUnit?: number;
  useLivePriceAsPurchasePrice: boolean;
}

export interface AddSharesRequest {
  quantity: number;
  costPerUnit?: number;
  useLivePriceAsPurchasePrice: boolean;
}

export interface CreateEtfHoldingRequest {
  ticker: string;
  market?: Market;
  name?: string;
  quantity: number;
  costPerUnit?: number;
  useLivePriceAsPurchasePrice: boolean;
}

export interface CreateMutualFundHoldingRequest {
  schemeCode: string;
  schemeName?: string;
  category: MfCategory;
  capitalisation?: Capitalisation;
  units: number;
  navPerUnit?: number;
  useLivePriceAsPurchasePrice: boolean;
}

export interface CreateNpsHoldingRequest {
  pensionFundManager: string;
  pran?: string;
  units: number;
  avgNav: number;
  currentNav?: number;
  equityPct: number;
  corporateDebtPct: number;
  governmentSecuritiesPct: number;
  alternativePct?: number;
}

export interface CreateDepositRequest {
  bankName: string;
  accountNumber?: string;
  depositType: DepositType;
  principalAmount: number;
  interestRatePct: number;
  startDate: string;
  maturityDate: string;
  compoundingFrequency: PaymentFrequency;
}

export interface CreateBondRequest {
  name: string;
  issuer: string;
  faceValue: number;
  couponRatePct: number;
  couponFrequency: PaymentFrequency;
  issueDate: string;
  maturityDate: string;
  purchasePrice: number;
  currentPrice?: number;
}

export interface CreateMetalHoldingRequest {
  metalType: MetalType;
  purityKarat?: number;
  quantityGrams: number;
  costPerGram?: number;
  useLivePriceAsPurchasePrice: boolean;
}

export interface CreateRealEstateRequest {
  name: string;
  propertyType: string;
  location?: string;
  purchasePrice: number;
  purchaseDate?: string;
  currentEstimatedValue: number;
  notes?: string;
}

export interface CreateOtherInstrumentRequest {
  name: string;
  category: string;
  investedAmount: number;
  currentValue: number;
  notes?: string;
  categoryMix: CategoryMixEntryDto[];
}

// ---------------------------------------------------------------------------
// Analytics & Dashboard DTOs
// ---------------------------------------------------------------------------

export interface BreakdownEntryDto {
  label: string;
  amount: number;
  percentage: number;
}

export interface HighestMoverDto {
  holdingId: string;
  name: string;
  gainLoss: number;
  gainLossPct: number;
}

export interface NpsAllocationSummaryDto {
  equityPct: number;
  corporateDebtPct: number;
  governmentSecuritiesPct: number;
  alternativePct: number;
}

export interface MetalsMiniPanelDto {
  totalInvested: number;
  totalValue: number;
  gainLoss: number;
  byMetalType: BreakdownEntryDto[];
}

export interface GrowthChartPointDto {
  date: string;
  invested: number;
  worth: number;
}

export interface PortfolioDashboardDto {
  presentValue: number;
  totalInvested: number;
  overallGainLoss?: number;
  gainLoss?: number;
  overallGainLossPct?: number;
  gainLossPct?: number;
  portfolioCompositionCount?: number;
  highestProfitHolding?: HighestMoverDto | null;
  highestLossHolding?: HighestMoverDto | null;
  oneDayChangeAmount?: number;
  oneDayChangePct?: number;
  assetAllocation: BreakdownEntryDto[];
  portfolioByCategory: BreakdownEntryDto[];
  mutualFundByCategory?: BreakdownEntryDto[];
  mutualFundByCapitalisation?: BreakdownEntryDto[];
  npsSchemeAllocation?: NpsAllocationSummaryDto;
  metalsMiniPanel?: MetalsMiniPanelDto;
  growthChartSeries?: GrowthChartPointDto[];
}

export interface GrowthOutlookRequest {
  expectedReturnPct: number;
  years: number;
  monthlySavings: number;
  inflationPct: number;
}

export interface GrowthProjectionPointDto {
  year: number;
  nominalValue: number;
  realValue?: number;
}

export interface GrowthOutlookResponseDto {
  todayValue: number;
  projectedValueNominal: number;
  projectedValueReal?: number;
  totalInvestedOverHorizon?: number;
  series: GrowthProjectionPointDto[];
}

export interface DrawdownCheckRequest {
  dropPct: number;
  recoveryReturnPct: number;
}

export interface DrawdownCheckResponseDto {
  equityBeforeDrop: number;
  equityAfterDrop: number;
  equityLoss: number;
  portfolioValueBeforeDrop?: number;
  portfolioValueAfterDrop?: number;
  portfolioBeforeDrop?: number;
  portfolioAfterDrop?: number;
  portfolioLevelImpactPct?: number;
  totalPortfolioDropPct?: number;
  estimatedYearsToRecover: number;
}

export interface LivePriceQuoteDto {
  price: number;
  isLive: boolean;
  asOf: string;
  source: string;
}

export interface SymbolSearchResultDto {
  ticker: string;
  companyName: string;
  market: string;
}

export interface PortfolioHoldingSummaryDto {
  id: string;
  name: string;
  assetType: AssetType;
  category: string;
  currentValue: number;
  isIncluded: boolean;
}
