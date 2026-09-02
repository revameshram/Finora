export type LoanType =
  | 'HOME_LOAN'
  | 'CAR_LOAN'
  | 'PERSONAL_LOAN'
  | 'EDUCATION_LOAN'
  | 'GOLD_LOAN'
  | 'BUSINESS_LOAN'
  | 'OTHER';

export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'REFINANCED';

export type PrepaymentType = 'ONE_TIME' | 'RECURRING_ANNUAL' | 'RECURRING_MONTHLY';

export type PrepaymentImpact = 'REDUCE_TENURE' | 'REDUCE_EMI';

export interface LoanDto {
  id: string;
  userId: string;
  loanName: string;
  loanType: LoanType;
  lenderName?: string;
  accountNumberMasked?: string;
  sanctionedAmount: number;
  currentOutstanding: number;
  annualInterestRate: number;
  tenureMonths: number;
  startDate: string;
  projectedEndDate?: string;
  monthlyEmi: number;
  status: LoanStatus;
  linkedNetWorthLiabilityId?: string;
  notes?: string;

  // Rollups
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalPrepaymentPaid: number;
  totalPaymentPayable: number;
  totalInterestPayable: number;
  progressPercent: number;
  remainingTenureMonths: number;
  isLinked: boolean;
  isIncluded: boolean;
  createdAt: string;
}

export interface CreateLoanRequest {
  loanName: string;
  loanType: LoanType;
  lenderName?: string;
  accountNumberMasked?: string;
  sanctionedAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  startDate: string;
  customMonthlyEmi?: number;
  syncWithNetWorth?: boolean;
  notes?: string;
}

export interface UpdateLoanRequest {
  loanName?: string;
  loanType?: LoanType;
  lenderName?: string;
  accountNumberMasked?: string;
  sanctionedAmount?: number;
  annualInterestRate?: number;
  tenureMonths?: number;
  startDate?: string;
  monthlyEmi?: number;
  status?: LoanStatus;
  syncWithNetWorth?: boolean;
  notes?: string;
}

export interface AddPrepaymentRequest {
  paymentDate: string;
  amount: number;
  prepaymentType: PrepaymentType;
  impact: PrepaymentImpact;
  notes?: string;
}

export interface LoanPrepaymentDto {
  id: string;
  loanId: string;
  paymentDate: string;
  amount: number;
  prepaymentType: PrepaymentType;
  impact: PrepaymentImpact;
  notes?: string;
  createdAt: string;
}

export interface AmortizationMonthDto {
  monthIndex: number;
  installmentNumber: number;
  paymentDate: string;
  openingBalance: number;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  prepaymentAmount: number;
  totalMonthlyPaid: number;
  closingBalance: number;
  isPaid: boolean;
  linkedExpenseTransactionId?: string;
}

export interface AmortizationYearDto {
  yearIndex: number;
  calendarYear: number;
  openingBalance: number;
  totalEmiPaid: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalPrepaymentPaid: number;
  closingBalance: number;
  months: AmortizationMonthDto[];
}

export interface AmortizationScheduleDto {
  loanId: string;
  sanctionedAmount: number;
  currentOutstanding: number;
  monthlyEmi: number;
  annualInterestRate: number;
  originalTenureMonths: number;
  actualTenureMonths: number;
  monthsSaved: number;
  startDate: string;
  projectedPayoffDate: string;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalPrepaymentPaid: number;
  totalAmountPayable: number;
  totalInterestSaved: number;
  yearlySchedules: AmortizationYearDto[];
  monthlySchedules: AmortizationMonthDto[];
}

export interface PrepaymentSimulationRequest {
  loanId?: string;
  amount: number;
  prepaymentType: PrepaymentType;
  impact: PrepaymentImpact;
  simulationDate?: string;
  startMonthIndex?: number;
}

export interface PrepaymentSimulationResultDto {
  baselineTotalInterest: number;
  baselineTotalPayment: number;
  baselineTenureMonths: number;
  baselinePayoffDate: string;

  simulatedTotalInterest: number;
  simulatedTotalPayment: number;
  simulatedTenureMonths: number;
  simulatedPayoffDate: string;
  simulatedNewMonthlyEmi: number;

  totalInterestSaved: number;
  monthsSaved: number;
  interestSavingsPercent: number;
  totalPrepaymentInvested: number;
}

export interface StandaloneEmiCalculateRequest {
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
}

export interface StandaloneEmiCalculateResponse {
  monthlyEmi: number;
  principalAmount: number;
  totalInterestPayable: number;
  totalPaymentPayable: number;
  interestToPrincipalRatio: number;
  principalPercentage: number;
  interestPercentage: number;
}

export interface EmiExpenseMatchDto {
  transactionId: string;
  description: string;
  amount: number;
  transactionDate: string;
  paymentMethod: string;
  isMatched: boolean;
  matchedInstallmentNumber?: number;
}
