import apiClient from '../api/client';
import {
  TripDto,
  CreateTripRequest,
  UpdateTripRequest,
  TripParticipantDto,
  CreateParticipantRequest,
  UpdateParticipantRequest,
  TripPlanStopDto,
  CreatePlanStopRequest,
  UpdatePlanStopRequest,
  TripCategoryBudgetDto,
  SetCategoryBudgetRequest,
  TripExpenseDto,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreatePaymentRequest,
  SmartSplitRequest,
  SmartSplitResponse,
  SettleMatrixDto,
  TripInsightsDto,
  TripPackingItemDto,
  CreatePackingItemRequest,
  TripChecklistItemDto,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
  AiTripPlanRequest,
  AiTripPlanResponse,
  PackingCategory,
  PackingTemplate,
  TripCategory,
} from '../types/trip';

export const tripApi = {
  // Trips
  listTrips: async (): Promise<TripDto[]> => {
    const res = await apiClient.get<TripDto[]>('/trips');
    return res.data;
  },

  getTrip: async (tripId: string): Promise<TripDto> => {
    const res = await apiClient.get<TripDto>(`/trips/${tripId}`);
    return res.data;
  },

  createTrip: async (data: CreateTripRequest): Promise<TripDto> => {
    const res = await apiClient.post<TripDto>('/trips', data);
    return res.data;
  },

  updateTrip: async (tripId: string, data: UpdateTripRequest): Promise<TripDto> => {
    const res = await apiClient.put<TripDto>(`/trips/${tripId}`, data);
    return res.data;
  },

  deleteTrip: async (tripId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}`);
  },

  seedSampleVietnam: async (): Promise<TripDto> => {
    const res = await apiClient.post<TripDto>('/trips/sample-vietnam');
    return res.data;
  },

  generateAiPlan: async (data: AiTripPlanRequest): Promise<AiTripPlanResponse> => {
    const res = await apiClient.post<AiTripPlanResponse>('/trips/ai-plan', data);
    return res.data;
  },

  // Participants
  getParticipants: async (tripId: string): Promise<TripParticipantDto[]> => {
    const res = await apiClient.get<TripParticipantDto[]>(`/trips/${tripId}/participants`);
    return res.data;
  },

  createParticipant: async (tripId: string, data: CreateParticipantRequest): Promise<TripParticipantDto> => {
    const res = await apiClient.post<TripParticipantDto>(`/trips/${tripId}/participants`, data);
    return res.data;
  },

  updateParticipant: async (tripId: string, participantId: string, data: UpdateParticipantRequest): Promise<TripParticipantDto> => {
    const res = await apiClient.put<TripParticipantDto>(`/trips/${tripId}/participants/${participantId}`, data);
    return res.data;
  },

  deleteParticipant: async (tripId: string, participantId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/participants/${participantId}`);
  },

  copyParticipants: async (tripId: string, fromTripId: string): Promise<void> => {
    await apiClient.post(`/trips/${tripId}/participants/copy-from/${fromTripId}`);
  },

  // Plan Stops
  getPlanStops: async (tripId: string, date?: string): Promise<TripPlanStopDto[]> => {
    const params = date ? { date } : {};
    const res = await apiClient.get<TripPlanStopDto[]>(`/trips/${tripId}/plan-stops`, { params });
    return res.data;
  },

  createPlanStop: async (tripId: string, data: CreatePlanStopRequest): Promise<TripPlanStopDto> => {
    const res = await apiClient.post<TripPlanStopDto>(`/trips/${tripId}/plan-stops`, data);
    return res.data;
  },

  updatePlanStop: async (tripId: string, stopId: string, data: UpdatePlanStopRequest): Promise<TripPlanStopDto> => {
    const res = await apiClient.put<TripPlanStopDto>(`/trips/${tripId}/plan-stops/${stopId}`, data);
    return res.data;
  },

  deletePlanStop: async (tripId: string, stopId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/plan-stops/${stopId}`);
  },

  // Category Budgets
  getCategoryBudgets: async (tripId: string): Promise<TripCategoryBudgetDto[]> => {
    const res = await apiClient.get<TripCategoryBudgetDto[]>(`/trips/${tripId}/budgets`);
    return res.data;
  },

  setCategoryBudget: async (tripId: string, data: SetCategoryBudgetRequest): Promise<void> => {
    await apiClient.put(`/trips/${tripId}/budgets`, data);
  },

  // Expenses & Splits
  getExpenses: async (tripId: string, category?: TripCategory): Promise<TripExpenseDto[]> => {
    const params = category ? { category } : {};
    const res = await apiClient.get<TripExpenseDto[]>(`/trips/${tripId}/expenses`, { params });
    return res.data;
  },

  createExpense: async (tripId: string, data: CreateExpenseRequest): Promise<TripExpenseDto> => {
    const res = await apiClient.post<TripExpenseDto>(`/trips/${tripId}/expenses`, data);
    return res.data;
  },

  updateExpense: async (tripId: string, expenseId: string, data: UpdateExpenseRequest): Promise<TripExpenseDto> => {
    const res = await apiClient.put<TripExpenseDto>(`/trips/${tripId}/expenses/${expenseId}`, data);
    return res.data;
  },

  deleteExpense: async (tripId: string, expenseId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/expenses/${expenseId}`);
  },

  calculateSmartSplit: async (tripId: string, data: SmartSplitRequest): Promise<SmartSplitResponse> => {
    const res = await apiClient.post<SmartSplitResponse>(`/trips/${tripId}/smart-split`, data);
    return res.data;
  },

  getSettleMatrix: async (tripId: string): Promise<SettleMatrixDto> => {
    const res = await apiClient.get<SettleMatrixDto>(`/trips/${tripId}/settle`);
    return res.data;
  },

  createPayment: async (tripId: string, data: CreatePaymentRequest): Promise<void> => {
    await apiClient.post(`/trips/${tripId}/payments`, data);
  },

  // Insights
  getInsights: async (tripId: string): Promise<TripInsightsDto> => {
    const res = await apiClient.get<TripInsightsDto>(`/trips/${tripId}/insights`);
    return res.data;
  },

  // Packing
  getPackingItems: async (tripId: string, category?: PackingCategory): Promise<TripPackingItemDto[]> => {
    const params = category ? { category } : {};
    const res = await apiClient.get<TripPackingItemDto[]>(`/trips/${tripId}/packing`, { params });
    return res.data;
  },

  createPackingItem: async (tripId: string, data: CreatePackingItemRequest): Promise<TripPackingItemDto> => {
    const res = await apiClient.post<TripPackingItemDto>(`/trips/${tripId}/packing`, data);
    return res.data;
  },

  togglePackingItem: async (tripId: string, itemId: string, packed: boolean): Promise<void> => {
    await apiClient.put(`/trips/${tripId}/packing/${itemId}/toggle`, null, { params: { packed } });
  },

  deletePackingItem: async (tripId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/packing/${itemId}`);
  },

  seedPackingTemplate: async (tripId: string, template: PackingTemplate): Promise<void> => {
    await apiClient.post(`/trips/${tripId}/packing/seed-template`, { template });
  },

  // Checklist
  getChecklistItems: async (tripId: string): Promise<TripChecklistItemDto[]> => {
    const res = await apiClient.get<TripChecklistItemDto[]>(`/trips/${tripId}/checklist`);
    return res.data;
  },

  createChecklistItem: async (tripId: string, data: CreateChecklistItemRequest): Promise<TripChecklistItemDto> => {
    const res = await apiClient.post<TripChecklistItemDto>(`/trips/${tripId}/checklist`, data);
    return res.data;
  },

  updateChecklistItem: async (tripId: string, itemId: string, data: UpdateChecklistItemRequest): Promise<TripChecklistItemDto> => {
    const res = await apiClient.put<TripChecklistItemDto>(`/trips/${tripId}/checklist/${itemId}`, data);
    return res.data;
  },

  deleteChecklistItem: async (tripId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/checklist/${itemId}`);
  },
};
