import apiClient from '../api/client';
import {
  LoanDto,
  CreateLoanRequest,
  UpdateLoanRequest,
  AddPrepaymentRequest,
  LoanPrepaymentDto,
  AmortizationScheduleDto,
  PrepaymentSimulationRequest,
  PrepaymentSimulationResultDto,
  StandaloneEmiCalculateRequest,
  StandaloneEmiCalculateResponse,
  EmiExpenseMatchDto,
} from '../types/emi';

export const emiApi = {
  getLoans: async (): Promise<LoanDto[]> => {
    const res = await apiClient.get<LoanDto[]>('/emi/loans');
    return res.data;
  },

  getLoan: async (loanId: string): Promise<LoanDto> => {
    const res = await apiClient.get<LoanDto>(`/emi/loans/${loanId}`);
    return res.data;
  },

  createLoan: async (data: CreateLoanRequest): Promise<LoanDto> => {
    const res = await apiClient.post<LoanDto>('/emi/loans', data);
    return res.data;
  },

  updateLoan: async (loanId: string, data: UpdateLoanRequest): Promise<LoanDto> => {
    const res = await apiClient.put<LoanDto>(`/emi/loans/${loanId}`, data);
    return res.data;
  },

  deleteLoan: async (loanId: string): Promise<void> => {
    await apiClient.delete(`/emi/loans/${loanId}`);
  },

  addPrepayment: async (loanId: string, data: AddPrepaymentRequest): Promise<LoanPrepaymentDto> => {
    const res = await apiClient.post<LoanPrepaymentDto>(`/emi/loans/${loanId}/prepayments`, data);
    return res.data;
  },

  getPrepayments: async (loanId: string): Promise<LoanPrepaymentDto[]> => {
    const res = await apiClient.get<LoanPrepaymentDto[]>(`/emi/loans/${loanId}/prepayments`);
    return res.data;
  },

  deletePrepayment: async (loanId: string, prepaymentId: string): Promise<void> => {
    await apiClient.delete(`/emi/loans/${loanId}/prepayments/${prepaymentId}`);
  },

  getAmortizationSchedule: async (loanId: string): Promise<AmortizationScheduleDto> => {
    const res = await apiClient.get<AmortizationScheduleDto>(`/emi/loans/${loanId}/amortization`);
    return res.data;
  },

  simulatePrepayment: async (
    loanId: string,
    data: PrepaymentSimulationRequest
  ): Promise<PrepaymentSimulationResultDto> => {
    const res = await apiClient.post<PrepaymentSimulationResultDto>(
      `/emi/loans/${loanId}/simulate-prepayment`,
      data
    );
    return res.data;
  },

  calculateStandalone: async (
    data: StandaloneEmiCalculateRequest
  ): Promise<StandaloneEmiCalculateResponse> => {
    const res = await apiClient.post<StandaloneEmiCalculateResponse>('/emi/calculate', data);
    return res.data;
  },

  getExpenseMatches: async (loanId: string): Promise<EmiExpenseMatchDto[]> => {
    const res = await apiClient.get<EmiExpenseMatchDto[]>(`/emi/loans/${loanId}/expense-matches`);
    return res.data;
  },

  seedSampleLoans: async (): Promise<LoanDto[]> => {
    const res = await apiClient.post<LoanDto[]>('/emi/seed-sample');
    return res.data;
  },
};

export default emiApi;
