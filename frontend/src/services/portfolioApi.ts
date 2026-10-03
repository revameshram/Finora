import apiClient from '../api/client';
import {
  StockHoldingDto,
  CreateStockHoldingRequest,
  AddSharesRequest,
  EtfHoldingDto,
  CreateEtfHoldingRequest,
  MutualFundHoldingDto,
  CreateMutualFundHoldingRequest,
  NpsHoldingDto,
  CreateNpsHoldingRequest,
  DepositDto,
  CreateDepositRequest,
  DepositScheduleEntryDto,
  BondDto,
  CreateBondRequest,
  BondScheduleEntryDto,
  MetalHoldingDto,
  CreateMetalHoldingRequest,
  RealEstateDto,
  CreateRealEstateRequest,
  OtherInstrumentDto,
  CreateOtherInstrumentRequest,
  PortfolioDashboardDto,
  GrowthOutlookRequest,
  GrowthOutlookResponseDto,
  DrawdownCheckRequest,
  DrawdownCheckResponseDto,
  LivePriceQuoteDto,
  SymbolSearchResultDto,
  PortfolioHoldingSummaryDto,
  AssetType,
  Market,
} from '../types/portfolio';

export const portfolioApi = {
  // ---------------------------------------------------------------------------
  // Stocks
  // ---------------------------------------------------------------------------
  listStocks: async (): Promise<StockHoldingDto[]> => {
    const res = await apiClient.get<StockHoldingDto[]>('/portfolio/stocks');
    return res.data;
  },

  createStock: async (req: CreateStockHoldingRequest): Promise<StockHoldingDto> => {
    const res = await apiClient.post<StockHoldingDto>('/portfolio/stocks', req);
    return res.data;
  },

  getStock: async (id: string): Promise<StockHoldingDto> => {
    const res = await apiClient.get<StockHoldingDto>(`/portfolio/stocks/${id}`);
    return res.data;
  },

  addSharesToStock: async (id: string, req: AddSharesRequest): Promise<StockHoldingDto> => {
    const res = await apiClient.post<StockHoldingDto>(`/portfolio/stocks/${id}/add-shares`, req);
    return res.data;
  },

  deleteStock: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/stocks/${id}`);
  },

  // ---------------------------------------------------------------------------
  // ETFs
  // ---------------------------------------------------------------------------
  listEtfs: async (): Promise<EtfHoldingDto[]> => {
    const res = await apiClient.get<EtfHoldingDto[]>('/portfolio/etfs');
    return res.data;
  },

  createEtf: async (req: CreateEtfHoldingRequest): Promise<EtfHoldingDto> => {
    const res = await apiClient.post<EtfHoldingDto>('/portfolio/etfs', req);
    return res.data;
  },

  getEtf: async (id: string): Promise<EtfHoldingDto> => {
    const res = await apiClient.get<EtfHoldingDto>(`/portfolio/etfs/${id}`);
    return res.data;
  },

  addSharesToEtf: async (id: string, req: AddSharesRequest): Promise<EtfHoldingDto> => {
    const res = await apiClient.post<EtfHoldingDto>(`/portfolio/etfs/${id}/add-shares`, req);
    return res.data;
  },

  deleteEtf: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/etfs/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Mutual Funds
  // ---------------------------------------------------------------------------
  listMutualFunds: async (): Promise<MutualFundHoldingDto[]> => {
    const res = await apiClient.get<MutualFundHoldingDto[]>('/portfolio/mutual-funds');
    return res.data;
  },

  createMutualFund: async (req: CreateMutualFundHoldingRequest): Promise<MutualFundHoldingDto> => {
    const res = await apiClient.post<MutualFundHoldingDto>('/portfolio/mutual-funds', req);
    return res.data;
  },

  deleteMutualFund: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/mutual-funds/${id}`);
  },

  // ---------------------------------------------------------------------------
  // NPS / UPS
  // ---------------------------------------------------------------------------
  listNps: async (): Promise<NpsHoldingDto[]> => {
    const res = await apiClient.get<NpsHoldingDto[]>('/portfolio/nps');
    return res.data;
  },

  createNps: async (req: CreateNpsHoldingRequest): Promise<NpsHoldingDto> => {
    const res = await apiClient.post<NpsHoldingDto>('/portfolio/nps', req);
    return res.data;
  },

  deleteNps: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/nps/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Deposits (FD/RD)
  // ---------------------------------------------------------------------------
  listDeposits: async (): Promise<DepositDto[]> => {
    const res = await apiClient.get<DepositDto[]>('/portfolio/deposits');
    return res.data;
  },

  createDeposit: async (req: CreateDepositRequest): Promise<DepositDto> => {
    const res = await apiClient.post<DepositDto>('/portfolio/deposits', req);
    return res.data;
  },

  getDepositSchedule: async (id: string): Promise<DepositScheduleEntryDto[]> => {
    const res = await apiClient.get<DepositScheduleEntryDto[]>(`/portfolio/deposits/${id}/schedule`);
    return res.data;
  },

  deleteDeposit: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/deposits/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Bonds
  // ---------------------------------------------------------------------------
  listBonds: async (): Promise<BondDto[]> => {
    const res = await apiClient.get<BondDto[]>('/portfolio/bonds');
    return res.data;
  },

  createBond: async (req: CreateBondRequest): Promise<BondDto> => {
    const res = await apiClient.post<BondDto>('/portfolio/bonds', req);
    return res.data;
  },

  getBondSchedule: async (id: string): Promise<BondScheduleEntryDto[]> => {
    const res = await apiClient.get<BondScheduleEntryDto[]>(`/portfolio/bonds/${id}/schedule`);
    return res.data;
  },

  deleteBond: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/bonds/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Metals
  // ---------------------------------------------------------------------------
  listMetals: async (): Promise<MetalHoldingDto[]> => {
    const res = await apiClient.get<MetalHoldingDto[]>('/portfolio/metals');
    return res.data;
  },

  createMetal: async (req: CreateMetalHoldingRequest): Promise<MetalHoldingDto> => {
    const res = await apiClient.post<MetalHoldingDto>('/portfolio/metals', req);
    return res.data;
  },

  deleteMetal: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/metals/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Real Estate
  // ---------------------------------------------------------------------------
  listRealEstate: async (): Promise<RealEstateDto[]> => {
    const res = await apiClient.get<RealEstateDto[]>('/portfolio/real-estate');
    return res.data;
  },

  createRealEstate: async (req: CreateRealEstateRequest): Promise<RealEstateDto> => {
    const res = await apiClient.post<RealEstateDto>('/portfolio/real-estate', req);
    return res.data;
  },

  deleteRealEstate: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/real-estate/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Others
  // ---------------------------------------------------------------------------
  listOtherInstruments: async (): Promise<OtherInstrumentDto[]> => {
    const res = await apiClient.get<OtherInstrumentDto[]>('/portfolio/others');
    return res.data;
  },

  createOtherInstrument: async (req: CreateOtherInstrumentRequest): Promise<OtherInstrumentDto> => {
    const res = await apiClient.post<OtherInstrumentDto>('/portfolio/others', req);
    return res.data;
  },

  deleteOtherInstrument: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/others/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Analytics & Projections
  // ---------------------------------------------------------------------------
  getDashboard: async (): Promise<PortfolioDashboardDto> => {
    const res = await apiClient.get<PortfolioDashboardDto>('/portfolio/dashboard');
    return res.data;
  },

  getGrowthAssumptions: async (): Promise<GrowthOutlookRequest> => {
    const res = await apiClient.get<GrowthOutlookRequest>('/portfolio/growth-outlook/assumptions');
    return res.data;
  },

  calculateGrowthOutlook: async (req: GrowthOutlookRequest): Promise<GrowthOutlookResponseDto> => {
    const res = await apiClient.post<GrowthOutlookResponseDto>('/portfolio/growth-outlook', req);
    return res.data;
  },

  resetGrowthAssumptions: async (): Promise<void> => {
    await apiClient.post('/portfolio/growth-outlook/reset');
  },

  calculateDrawdown: async (req: DrawdownCheckRequest): Promise<DrawdownCheckResponseDto> => {
    const res = await apiClient.post<DrawdownCheckResponseDto>('/portfolio/drawdown-check', req);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Universal Utilities: Live Price, Search, Refresh, Summary, Sample Seed
  // ---------------------------------------------------------------------------
  searchSymbols: async (assetType: string, query: string): Promise<SymbolSearchResultDto[]> => {
    const res = await apiClient.get<SymbolSearchResultDto[]>('/portfolio/search', {
      params: { assetType, query },
    });
    return res.data;
  },

  getLivePricePreview: async (
    assetType: AssetType,
    symbol: string,
    market?: Market
  ): Promise<LivePriceQuoteDto> => {
    const res = await apiClient.get<LivePriceQuoteDto>('/portfolio/live-price', {
      params: { assetType, symbol, market },
    });
    return res.data;
  },

  refreshPrices: async (): Promise<void> => {
    await apiClient.post('/portfolio/refresh-prices');
  },

  getPortfolioSummary: async (): Promise<PortfolioHoldingSummaryDto[]> => {
    const res = await apiClient.get<PortfolioHoldingSummaryDto[]>('/portfolio/summary');
    return res.data;
  },

  seedSampleData: async (): Promise<PortfolioDashboardDto> => {
    const res = await apiClient.post<PortfolioDashboardDto>('/portfolio/sample-seed');
    return res.data;
  },
};
