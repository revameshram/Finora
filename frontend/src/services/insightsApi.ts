import apiClient from '../api/client';

export interface FinancialHealthScore {
  overallScore: number;
  statusTier: string;
  summary?: string;
  cashFlowScore: number;
  solvencyScore: number;
  goalPacingScore: number;
  retirementReadinessScore?: number;
  retirementFreedomScore?: number;
  savingsRatePct?: number;
  debtToAssetRatioPct?: number;
  emergencyRunwayMonths?: number;
  cashFlowStatus?: string;
  solvencyStatus?: string;
  goalPacingStatus?: string;
  retirementFreedomStatus?: string;
  primaryRecommendation?: string;
}

export interface KeyMetricItem {
  id: string;
  lifeArea: 'CASH_FLOW' | 'DEBT' | 'WEALTH' | 'LIFE_ADMIN' | string;
  label: string;
  rawValue?: number;
  displayValue?: string;
  value?: string;
  subtext?: string;
  changeDescription?: string;
  trend?: string;
  healthIndicator?: 'POSITIVE' | 'NEUTRAL' | 'WARNING' | 'CRITICAL' | string;
  sourceModule: string;
  sourceModuleId?: string;
  targetModuleRoute?: string;
}

export interface RecommendationNudge {
  id: string;
  severity?: string;
  urgency?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  title: string;
  message?: string;
  description?: string;
  sourceModule: string;
  sourceModuleId?: string;
  actionLabel?: string;
  actionText?: string;
  actionRoute?: string;
  targetModuleId?: string;
}

export interface SuiteInsights {
  healthScore: FinancialHealthScore;
  keyMetrics: KeyMetricItem[];
  recommendations: RecommendationNudge[];
  executiveSummary: string;
  assetAllocationDistribution: Record<string, number>;
}

export const insightsApi = {
  getSuiteInsights: async (): Promise<SuiteInsights> => {
    const response = await apiClient.get<SuiteInsights>('/insights/suite');
    return response.data;
  },
};
