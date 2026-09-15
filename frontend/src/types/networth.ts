export type AssetCategory =
  | 'CASH_BANK'
  | 'INVESTMENTS'
  | 'CRYPTO'
  | 'GOLD_SILVER'
  | 'REAL_ESTATE'
  | 'VEHICLES'
  | 'RETIREMENT_ACCOUNTS'
  | 'BUSINESS_ASSETS'
  | 'OTHER';

export type LiabilityCategory =
  | 'HOME_LOAN'
  | 'CAR_LOAN'
  | 'PERSONAL_LOAN'
  | 'CREDIT_CARD'
  | 'STUDENT_LOAN'
  | 'BUSINESS_LOAN'
  | 'OTHER_DEBT';

export interface AssetDto {
  id: string;
  userId: string;
  name: string;
  category: AssetCategory;
  value: number;
  acquiredDate?: string;
  growthRatePct?: number;
  recurringInvestment?: number;
  notes?: string;
  sourceModule: string;
  sourceEntityId?: string;
  isIncluded: boolean;
  isLinked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetRequest {
  name: string;
  category: AssetCategory;
  value: number;
  acquiredDate?: string;
  growthRatePct?: number;
  recurringInvestment?: number;
  notes?: string;
}

export interface UpdateAssetRequest {
  name?: string;
  category?: AssetCategory;
  value?: number;
  growthRatePct?: number;
  recurringInvestment?: number;
  notes?: string;
  isIncluded?: boolean;
}

export interface NetWorthLiabilityDto {
  id: string;
  name: string;
  category: string;
  balance: number;
  interestRatePct?: number;
  monthlyPayment?: number;
  isIncluded: boolean;
  isLinked: boolean;
  sourceModule: string;
  sourceEntityId?: string;
  notes?: string;
  updatedAt: string;
}

export interface CreateLiabilityRequest {
  name: string;
  category: LiabilityCategory;
  amount: number;
  incurredDate?: string;
  interestRatePct?: number;
  recurringPayment?: number;
  notes?: string;
  sourceModule?: string;
  sourceEntityId?: string;
  isLinked?: boolean;
}

export interface UpdateLiabilityRequest {
  name?: string;
  category?: LiabilityCategory;
  amount?: number;
  interestRatePct?: number;
  recurringPayment?: number;
  notes?: string;
  isIncluded?: boolean;
}

export interface CategoryBreakdownDto {
  category: string;
  amount: number;
  percentage: number;
}

export interface TopHoldingDto {
  id: string;
  name: string;
  type: 'ASSET' | 'LIABILITY';
  category: string;
  amount: number;
  percentageOfTotal: number;
}

export interface NetWorthSummaryDto {
  totalAssets: number;
  manualAssetsTotal: number;
  portfolioLinkedAssetsTotal: number;
  totalLiabilities: number;
  netWorth: number;
  thirtyDayVelocity: number;
  debtToAssetRatioPct: number;
  liquidityRatioPct: number;
  healthScore: number;
  assetsByCategory: CategoryBreakdownDto[];
  liabilitiesByCategory: CategoryBreakdownDto[];
  topAssets: TopHoldingDto[];
  topLiabilities: TopHoldingDto[];
}

export interface GrowthProjectionPoint {
  year: number;
  nominalValue: number;
  realValue: number;
  cumulativeContributions: number;
  interestEarned: number;
}

export interface ScenarioProjectionDto {
  scenarioName: string;
  cagrPct: number;
  doublesInYears: number;
  projectedNetWorthNominal: number;
  projectedNetWorthReal: number;
  yearlyPoints: GrowthProjectionPoint[];
}

export interface NetWorthProjectionRequest {
  conservativeCagrPct: number;
  moderateCagrPct: number;
  aggressiveCagrPct: number;
  monthlySavingsContribution: number;
  inflationPct: number;
  years: number;
}

export interface NetWorthProjectionResponseDto {
  currentNetWorth: number;
  portfolioLinkedAssetsHeldFlat: number;
  manualAssetsTotal: number;
  totalLiabilities: number;
  conservativeScenario: ScenarioProjectionDto;
  moderateScenario: ScenarioProjectionDto;
  aggressiveScenario: ScenarioProjectionDto;
}

export interface RecommendationCardDto {
  type: 'positive' | 'warning' | 'neutral' | 'critical';
  title: string;
  description: string;
  actionLabel?: string;
  actionModule?: string;
}

export interface NetWorthInsightsDto {
  healthScore: number;
  healthBadge: string;
  debtToAssetRatioPct: number;
  debtToAssetStatus: string;
  liquidityRatioPct: number;
  liquidityStatus: string;
  largestAsset?: TopHoldingDto;
  largestLiability?: TopHoldingDto;
  recommendations: RecommendationCardDto[];
}
