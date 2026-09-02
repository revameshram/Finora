export type TripStatus = 'PLANNING' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type TripCategory = 
  | 'TRANSPORTATION'
  | 'ACCOMMODATION'
  | 'FOOD_DINING'
  | 'ACTIVITIES_ENTERTAINMENT'
  | 'SHOPPING'
  | 'MISCELLANEOUS'
  | 'TOUR_OPERATOR';

export type ParticipantCategory = 
  | 'TOURIST'
  | 'TRAVEL_MANAGER'
  | 'DRIVER'
  | 'COOK'
  | 'GUIDE'
  | 'OTHER';

export type PlanStopCategory = 
  | 'FLIGHT'
  | 'HOTEL'
  | 'ACTIVITY'
  | 'FOOD'
  | 'TRANSIT'
  | 'SIGHTSEEING'
  | 'OTHER';

export type SplitType = 'EQUAL' | 'EXACT_AMOUNT' | 'PERCENTAGE' | 'SHARES';

export type PackingCategory = 
  | 'ESSENTIALS'
  | 'CLOTHING'
  | 'ELECTRONICS'
  | 'DOCUMENTS'
  | 'MEDICINE'
  | 'TOILETRIES'
  | 'OTHER';

export type PackingTemplate = 'BASIC_ESSENTIALS' | 'BEACH_TRIP' | 'BUSINESS' | 'COLD_WEATHER';

export type ChecklistPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TripDto {
  id: string;
  userId: string;
  name: string;
  destination?: string;
  departureLocation?: string;
  adultsCount: number;
  kidsCount: number;
  startDate?: string;
  endDate?: string;
  hotelPreference?: string;
  additionalDetails?: string;
  status: TripStatus;
  totalBudget: number;
  totalSpent: number;
  participantsCount: number;
  stopsCount: number;
  checklistOpenCount: number;
  checklistTotalCount: number;
  packingPackedCount: number;
  packingTotalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripRequest {
  name: string;
  destination?: string;
  departureLocation?: string;
  adultsCount: number;
  kidsCount: number;
  startDate?: string;
  endDate?: string;
  hotelPreference?: string;
  additionalDetails?: string;
  totalBudget?: number;
}

export interface UpdateTripRequest {
  name?: string;
  destination?: string;
  departureLocation?: string;
  adultsCount?: number;
  kidsCount?: number;
  startDate?: string;
  endDate?: string;
  hotelPreference?: string;
  additionalDetails?: string;
  status?: TripStatus;
  totalBudget?: number;
}

export interface TripParticipantDto {
  id: string;
  tripId: string;
  name: string;
  email?: string;
  mobile?: string;
  dob?: string;
  preferredLanguage?: string;
  foodPreferences?: string;
  category: ParticipantCategory;
  parentParticipantId?: string;
  parentName?: string;
  dependents: TripParticipantDto[];
  createdAt: string;
}

export interface CreateParticipantRequest {
  name: string;
  email?: string;
  mobile?: string;
  dob?: string;
  preferredLanguage?: string;
  foodPreferences?: string;
  category: ParticipantCategory;
  parentParticipantId?: string;
}

export interface UpdateParticipantRequest {
  name?: string;
  email?: string;
  mobile?: string;
  dob?: string;
  preferredLanguage?: string;
  foodPreferences?: string;
  category?: ParticipantCategory;
  parentParticipantId?: string;
}

export interface TripPlanStopDto {
  id: string;
  tripId: string;
  stopDate: string;
  stopTime?: string;
  title: string;
  category: PlanStopCategory;
  location?: string;
  description?: string;
  estimatedCost: number;
  assignedParticipantIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanStopRequest {
  stopDate: string;
  stopTime?: string;
  title: string;
  category: PlanStopCategory;
  location?: string;
  description?: string;
  estimatedCost?: number;
  assignedParticipantIds?: string[];
  notes?: string;
}

export interface UpdatePlanStopRequest {
  stopDate?: string;
  stopTime?: string;
  title?: string;
  category?: PlanStopCategory;
  location?: string;
  description?: string;
  estimatedCost?: number;
  assignedParticipantIds?: string[];
  notes?: string;
}

export interface TripCategoryBudgetDto {
  id: string;
  tripId: string;
  category: TripCategory;
  budgetAmount: number;
  actualSpent: number;
  utilizationPercent: number;
}

export interface SetCategoryBudgetRequest {
  category: TripCategory;
  budgetAmount: number;
}

export interface TripExpenseSplitDto {
  id: string;
  participantId: string;
  participantName?: string;
  splitType: SplitType;
  splitValue: number;
  computedAmount: number;
}

export interface TripExpensePaymentDto {
  id: string;
  tripId: string;
  expenseId?: string;
  fromParticipantId: string;
  fromParticipantName?: string;
  toParticipantId: string;
  toParticipantName?: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  paymentStatus: string;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface TripExpenseDto {
  id: string;
  tripId: string;
  payerId?: string;
  payerName?: string;
  description: string;
  category: TripCategory;
  amount: number;
  originalCurrency: string;
  originalAmount: number;
  expenseDate: string;
  paymentStatus: string;
  notes?: string;
  splits: TripExpenseSplitDto[];
  payments: TripExpensePaymentDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  payerId?: string;
  description: string;
  category: TripCategory;
  amount: number;
  originalCurrency?: string;
  originalAmount?: number;
  expenseDate?: string;
  paymentStatus?: string;
  notes?: string;
  splits?: Array<{
    participantId: string;
    splitType: SplitType;
    splitValue: number;
  }>;
}

export interface UpdateExpenseRequest {
  payerId?: string;
  description?: string;
  category?: TripCategory;
  amount?: number;
  originalCurrency?: string;
  originalAmount?: number;
  expenseDate?: string;
  paymentStatus?: string;
  notes?: string;
  splits?: Array<{
    participantId: string;
    splitType: SplitType;
    splitValue: number;
  }>;
}

export interface CreatePaymentRequest {
  expenseId?: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  paymentMethod?: string;
  paymentDate?: string;
  paymentStatus?: string;
  referenceId?: string;
  notes?: string;
}

export interface SmartSplitRequest {
  totalAmount: number;
  splitType: SplitType;
  participants: Array<{
    participantId: string;
    value: number;
  }>;
}

export interface SmartSplitResponse {
  totalAmount: number;
  computedSum: number;
  roundingRemainder: number;
  splits: Array<{
    participantId: string;
    shareValue: number;
    calculatedAmount: number;
    effectivePercentage: number;
  }>;
}

export interface SettleMatrixDto {
  totalTripExpenses: number;
  totalPaymentsMade: number;
  totalUnsettledBalance: number;
  participantBalances: Array<{
    participantId: string;
    participantName: string;
    totalPaid: number;
    totalShare: number;
    netBalance: number;
    status: 'OWED' | 'OWES' | 'SETTLED';
  }>;
  suggestedTransfers: Array<{
    fromParticipantId: string;
    fromParticipantName: string;
    toParticipantId: string;
    toParticipantName: string;
    amount: number;
  }>;
}

export interface TripInsightsDto {
  totalBudget: number;
  totalSpent: number;
  budgetLeft: number;
  usedPercent: number;
  dailyAverage: number;
  tripDurationDays: number;
  daysElapsed: number;
  daysRemaining: number;
  spendingVelocityDaily: number;
  projectedTotalCost: number;
  projectedRemainingSpend: number;
  budgetPacingStatus: 'ON_TRACK' | 'OVER_BUDGET' | 'UNDER_BUDGET';
  costPerDay: number;
  costPerPersonPerDay: number;
  averageExpenseSize: number;
  totalPaymentsMade: number;
  paymentCoveragePercent: number;
  totalExpensesCount: number;
  fullyPaidExpensesCount: number;
  pendingExpensesCount: number;
  categoryBreakdown: Array<{
    category: TripCategory;
    categoryName: string;
    spentAmount: number;
    budgetAmount: number;
    percentageOfTotalSpent: number;
    categoryUtilizationPercent: number;
  }>;
  recommendations: string[];
}

export interface TripPackingItemDto {
  id: string;
  tripId: string;
  name: string;
  category: PackingCategory;
  packed: boolean;
  createdAt: string;
}

export interface CreatePackingItemRequest {
  name: string;
  category: PackingCategory;
}

export interface TripChecklistItemDto {
  id: string;
  tripId: string;
  title: string;
  category: string;
  priority: ChecklistPriority;
  dueDate?: string;
  assignedParticipantId?: string;
  assignedParticipantName?: string;
  description?: string;
  done: boolean;
  createdAt: string;
}

export interface CreateChecklistItemRequest {
  title: string;
  category?: string;
  priority: ChecklistPriority;
  dueDate?: string;
  assignedParticipantId?: string;
  description?: string;
}

export interface UpdateChecklistItemRequest {
  title?: string;
  category?: string;
  priority?: ChecklistPriority;
  dueDate?: string;
  assignedParticipantId?: string;
  description?: string;
  done?: boolean;
}

export interface AiTripPlanRequest {
  destination?: string;
  departureLocation?: string;
  adultsCount?: number;
  kidsCount?: number;
  startDate?: string;
  endDate?: string;
  hotelPreference?: string;
  promptText?: string;
  estimatedBudget?: number;
}

export interface AiTripPlanResponse {
  generatedTripTitle: string;
  generatedSubtitle: string;
  destination: string;
  description: string;
  recommendedBudget: number;
  remainingDailyQuota: number;
  suggestedStops: Array<{
    dayNumber: number;
    time: string;
    title: string;
    category: string;
    location: string;
    description: string;
    estimatedCost: number;
  }>;
  recommendedPackingItems: string[];
}
