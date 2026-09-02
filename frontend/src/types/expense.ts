import { SourceModule } from './index';

export type ExpenseCategory =
  | 'HOUSING'
  | 'UTILITIES'
  | 'FOOD_GROCERIES'
  | 'DINING_OUT'
  | 'TRANSPORTATION'
  | 'HEALTHCARE'
  | 'ENTERTAINMENT'
  | 'SHOPPING'
  | 'INVESTMENT'
  | 'SAVINGS'
  | 'RETIREMENT'
  | 'FIRE'
  | 'TRAVEL'
  | 'EMI'
  | 'EDUCATION'
  | 'PERSONAL_CARE'
  | 'OTHER';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  HOUSING: 'Housing / Rent',
  UTILITIES: 'Utilities & Bills',
  FOOD_GROCERIES: 'Food & Groceries',
  DINING_OUT: 'Dining Out & Cafes',
  TRANSPORTATION: 'Transportation & Fuel',
  HEALTHCARE: 'Healthcare & Medical',
  ENTERTAINMENT: 'Entertainment & Leisure',
  SHOPPING: 'Shopping & Personal',
  INVESTMENT: 'Investment / Mutual Funds',
  SAVINGS: 'Savings & Deposits',
  RETIREMENT: 'Retirement (NPS/PPF)',
  FIRE: 'FIRE Sinking Fund',
  TRAVEL: 'Travel & Vacation',
  EMI: 'EMI / Loan Repayment',
  EDUCATION: 'Education & Upskilling',
  PERSONAL_CARE: 'Personal Care & Fitness',
  OTHER: 'Other Miscellaneous',
};

export type TransactionStatus = 'PENDING' | 'DONE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface IncomeSource {
  id: string;
  profileId: string;
  budgetMonth: string;
  name: string;
  amount: number; // In base INR
  instrument?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseTransaction {
  id: string;
  profileId: string;
  budgetMonth: string;
  item: string;
  description?: string;
  category: ExpenseCategory;
  amount: number; // In base INR
  status: TransactionStatus;
  paymentDate?: string;
  paymentMethod?: string;
  linkedGoalId?: string;
  isIncluded: boolean;
  isLinked: boolean;
  sourceModule: SourceModule;
  sourceEntityId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseTask {
  id: string;
  profileId: string;
  budgetMonth: string;
  task: string;
  status: TaskStatus;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyNote {
  id: string;
  profileId: string;
  budgetMonth: string;
  content: string;
  createdAt: string;
}

export interface ExpenseDashboardMetrics {
  budgetMonth: string;
  totalInflow: number;
  totalOutflow: number;
  cashFlow: number;
  netPosition: number;
  pendingOutflow: number;
  completedTransactionsCount: number;
  pendingTransactionsCount: number;
  totalIncomeSourcesCount: number;
}

export interface ExpenseInsights {
  budgetMonth: string;
  financialHealthScore: number;
  healthBadge: string;
  savingsRate: number;
  expenseRatio: number;
  pendingRatio: number;
  emergencyFundTarget: number;
  largestIncomeAmount: number;
  largestIncomeName: string;
  largestExpenseAmount: number;
  largestExpenseItem: string;
  cashFlowVelocity: number;
  recommendations: string[];
}
