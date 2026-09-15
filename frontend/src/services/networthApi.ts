import apiClient from '../api/apiClient';
import {
  AssetDto,
  CreateAssetRequest,
  UpdateAssetRequest,
  NetWorthLiabilityDto,
  CreateLiabilityRequest,
  UpdateLiabilityRequest,
  NetWorthSummaryDto,
  NetWorthProjectionRequest,
  NetWorthProjectionResponseDto,
  NetWorthInsightsDto,
} from '../types/networth';

export const networthApi = {
  // Summary
  getSummary: async (): Promise<NetWorthSummaryDto> => {
    const res = await apiClient.get<NetWorthSummaryDto>('/networth/summary');
    return res.data;
  },

  // Assets
  getAssets: async (): Promise<AssetDto[]> => {
    const res = await apiClient.get<AssetDto[]>('/networth/assets');
    return res.data;
  },

  createAsset: async (req: CreateAssetRequest): Promise<AssetDto> => {
    const res = await apiClient.post<AssetDto>('/networth/assets', req);
    return res.data;
  },

  updateAsset: async (id: string, req: UpdateAssetRequest): Promise<AssetDto> => {
    const res = await apiClient.put<AssetDto>(`/networth/assets/${id}`, req);
    return res.data;
  },

  delinkAsset: async (id: string): Promise<AssetDto> => {
    const res = await apiClient.post<AssetDto>(`/networth/assets/${id}/delink`);
    return res.data;
  },

  deleteAsset: async (id: string): Promise<void> => {
    await apiClient.delete(`/networth/assets/${id}`);
  },

  // Liabilities
  getLiabilities: async (): Promise<NetWorthLiabilityDto[]> => {
    const res = await apiClient.get<NetWorthLiabilityDto[]>('/networth/liabilities');
    return res.data;
  },

  createLiability: async (req: CreateLiabilityRequest): Promise<NetWorthLiabilityDto> => {
    const res = await apiClient.post<NetWorthLiabilityDto>('/networth/liabilities', req);
    return res.data;
  },

  updateLiability: async (id: string, req: UpdateLiabilityRequest): Promise<NetWorthLiabilityDto> => {
    const res = await apiClient.put<NetWorthLiabilityDto>(`/networth/liabilities/${id}`, req);
    return res.data;
  },

  delinkLiability: async (id: string): Promise<NetWorthLiabilityDto> => {
    const res = await apiClient.post<NetWorthLiabilityDto>(`/networth/liabilities/${id}/delink`);
    return res.data;
  },

  deleteLiability: async (id: string): Promise<void> => {
    await apiClient.delete(`/networth/liabilities/${id}`);
  },

  // Analytics & Projections
  calculateProjections: async (req: NetWorthProjectionRequest): Promise<NetWorthProjectionResponseDto> => {
    const res = await apiClient.post<NetWorthProjectionResponseDto>('/networth/projections', req);
    return res.data;
  },

  getInsights: async (): Promise<NetWorthInsightsDto> => {
    const res = await apiClient.get<NetWorthInsightsDto>('/networth/insights');
    return res.data;
  },

  seedSampleData: async (): Promise<NetWorthSummaryDto> => {
    const res = await apiClient.post<NetWorthSummaryDto>('/networth/sample-seed');
    return res.data;
  },
};
