package com.finora.trip.dto;

import com.finora.trip.model.TripCategory;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class TripInsightsDto {
    // Top stat row
    private BigDecimal totalBudget = BigDecimal.ZERO;
    private BigDecimal totalSpent = BigDecimal.ZERO;
    private BigDecimal budgetLeft = BigDecimal.ZERO;
    private BigDecimal usedPercent = BigDecimal.ZERO; // Guarded against 0 budget
    private BigDecimal dailyAverage = BigDecimal.ZERO; // Guarded against 0 elapsed days
    private int tripDurationDays = 1;
    private int daysElapsed = 0;
    private int daysRemaining = 0;

    // Spending velocity & projections
    private BigDecimal spendingVelocityDaily = BigDecimal.ZERO;
    private BigDecimal projectedTotalCost = BigDecimal.ZERO;
    private BigDecimal projectedRemainingSpend = BigDecimal.ZERO;
    private String budgetPacingStatus; // "ON_TRACK", "OVER_BUDGET", "UNDER_BUDGET"

    // Cost efficiency metrics
    private BigDecimal costPerDay = BigDecimal.ZERO;
    private BigDecimal costPerPersonPerDay = BigDecimal.ZERO;
    private BigDecimal averageExpenseSize = BigDecimal.ZERO;

    // Payment tracking & coverage
    private BigDecimal totalPaymentsMade = BigDecimal.ZERO;
    private BigDecimal paymentCoveragePercent = BigDecimal.ZERO; // Guarded against 0 spent
    private int totalExpensesCount = 0;
    private int fullyPaidExpensesCount = 0;
    private int pendingExpensesCount = 0;

    // Category Breakdowns
    private List<CategorySpendingItemDto> categoryBreakdown = new ArrayList<>();
    private List<ParticipantSpendingItemDto> participantBreakdown = new ArrayList<>();

    // Actionable Recommendations
    private List<String> recommendations = new ArrayList<>();

    public static class CategorySpendingItemDto {
        private TripCategory category;
        private String categoryName;
        private BigDecimal spentAmount = BigDecimal.ZERO;
        private BigDecimal budgetAmount = BigDecimal.ZERO;
        private BigDecimal percentageOfTotalSpent = BigDecimal.ZERO;
        private BigDecimal categoryUtilizationPercent = BigDecimal.ZERO;

        public CategorySpendingItemDto() {
        }

        public CategorySpendingItemDto(TripCategory category, String categoryName, BigDecimal spentAmount, BigDecimal budgetAmount, BigDecimal percentageOfTotalSpent, BigDecimal categoryUtilizationPercent) {
            this.category = category;
            this.categoryName = categoryName;
            this.spentAmount = spentAmount != null ? spentAmount : BigDecimal.ZERO;
            this.budgetAmount = budgetAmount != null ? budgetAmount : BigDecimal.ZERO;
            this.percentageOfTotalSpent = percentageOfTotalSpent != null ? percentageOfTotalSpent : BigDecimal.ZERO;
            this.categoryUtilizationPercent = categoryUtilizationPercent != null ? categoryUtilizationPercent : BigDecimal.ZERO;
        }

        public TripCategory getCategory() {
            return category;
        }

        public void setCategory(TripCategory category) {
            this.category = category;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public BigDecimal getSpentAmount() {
            return spentAmount;
        }

        public void setSpentAmount(BigDecimal spentAmount) {
            this.spentAmount = spentAmount;
        }

        public BigDecimal getBudgetAmount() {
            return budgetAmount;
        }

        public void setBudgetAmount(BigDecimal budgetAmount) {
            this.budgetAmount = budgetAmount;
        }

        public BigDecimal getPercentageOfTotalSpent() {
            return percentageOfTotalSpent;
        }

        public void setPercentageOfTotalSpent(BigDecimal percentageOfTotalSpent) {
            this.percentageOfTotalSpent = percentageOfTotalSpent;
        }

        public BigDecimal getCategoryUtilizationPercent() {
            return categoryUtilizationPercent;
        }

        public void setCategoryUtilizationPercent(BigDecimal categoryUtilizationPercent) {
            this.categoryUtilizationPercent = categoryUtilizationPercent;
        }
    }

    public static class ParticipantSpendingItemDto {
        private String participantId;
        private String participantName;
        private BigDecimal paidAmount = BigDecimal.ZERO;
        private BigDecimal shareAmount = BigDecimal.ZERO;
        private BigDecimal netBalance = BigDecimal.ZERO;

        public ParticipantSpendingItemDto() {
        }

        public ParticipantSpendingItemDto(String participantId, String participantName, BigDecimal paidAmount, BigDecimal shareAmount, BigDecimal netBalance) {
            this.participantId = participantId;
            this.participantName = participantName;
            this.paidAmount = paidAmount != null ? paidAmount : BigDecimal.ZERO;
            this.shareAmount = shareAmount != null ? shareAmount : BigDecimal.ZERO;
            this.netBalance = netBalance != null ? netBalance : BigDecimal.ZERO;
        }

        public String getParticipantId() {
            return participantId;
        }

        public void setParticipantId(String participantId) {
            this.participantId = participantId;
        }

        public String getParticipantName() {
            return participantName;
        }

        public void setParticipantName(String participantName) {
            this.participantName = participantName;
        }

        public BigDecimal getPaidAmount() {
            return paidAmount;
        }

        public void setPaidAmount(BigDecimal paidAmount) {
            this.paidAmount = paidAmount;
        }

        public BigDecimal getShareAmount() {
            return shareAmount;
        }

        public void setShareAmount(BigDecimal shareAmount) {
            this.shareAmount = shareAmount;
        }

        public BigDecimal getNetBalance() {
            return netBalance;
        }

        public void setNetBalance(BigDecimal netBalance) {
            this.netBalance = netBalance;
        }
    }

    public TripInsightsDto() {
    }

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public BigDecimal getBudgetLeft() {
        return budgetLeft;
    }

    public void setBudgetLeft(BigDecimal budgetLeft) {
        this.budgetLeft = budgetLeft;
    }

    public BigDecimal getUsedPercent() {
        return usedPercent;
    }

    public void setUsedPercent(BigDecimal usedPercent) {
        this.usedPercent = usedPercent;
    }

    public BigDecimal getDailyAverage() {
        return dailyAverage;
    }

    public void setDailyAverage(BigDecimal dailyAverage) {
        this.dailyAverage = dailyAverage;
    }

    public int getTripDurationDays() {
        return tripDurationDays;
    }

    public void setTripDurationDays(int tripDurationDays) {
        this.tripDurationDays = tripDurationDays;
    }

    public int getDaysElapsed() {
        return daysElapsed;
    }

    public void setDaysElapsed(int daysElapsed) {
        this.daysElapsed = daysElapsed;
    }

    public int getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(int daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public BigDecimal getSpendingVelocityDaily() {
        return spendingVelocityDaily;
    }

    public void setSpendingVelocityDaily(BigDecimal spendingVelocityDaily) {
        this.spendingVelocityDaily = spendingVelocityDaily;
    }

    public BigDecimal getProjectedTotalCost() {
        return projectedTotalCost;
    }

    public void setProjectedTotalCost(BigDecimal projectedTotalCost) {
        this.projectedTotalCost = projectedTotalCost;
    }

    public BigDecimal getProjectedRemainingSpend() {
        return projectedRemainingSpend;
    }

    public void setProjectedRemainingSpend(BigDecimal projectedRemainingSpend) {
        this.projectedRemainingSpend = projectedRemainingSpend;
    }

    public String getBudgetPacingStatus() {
        return budgetPacingStatus;
    }

    public void setBudgetPacingStatus(String budgetPacingStatus) {
        this.budgetPacingStatus = budgetPacingStatus;
    }

    public BigDecimal getCostPerDay() {
        return costPerDay;
    }

    public void setCostPerDay(BigDecimal costPerDay) {
        this.costPerDay = costPerDay;
    }

    public BigDecimal getCostPerPersonPerDay() {
        return costPerPersonPerDay;
    }

    public void setCostPerPersonPerDay(BigDecimal costPerPersonPerDay) {
        this.costPerPersonPerDay = costPerPersonPerDay;
    }

    public BigDecimal getAverageExpenseSize() {
        return averageExpenseSize;
    }

    public void setAverageExpenseSize(BigDecimal averageExpenseSize) {
        this.averageExpenseSize = averageExpenseSize;
    }

    public BigDecimal getTotalPaymentsMade() {
        return totalPaymentsMade;
    }

    public void setTotalPaymentsMade(BigDecimal totalPaymentsMade) {
        this.totalPaymentsMade = totalPaymentsMade;
    }

    public BigDecimal getPaymentCoveragePercent() {
        return paymentCoveragePercent;
    }

    public void setPaymentCoveragePercent(BigDecimal paymentCoveragePercent) {
        this.paymentCoveragePercent = paymentCoveragePercent;
    }

    public int getTotalExpensesCount() {
        return totalExpensesCount;
    }

    public void setTotalExpensesCount(int totalExpensesCount) {
        this.totalExpensesCount = totalExpensesCount;
    }

    public int getFullyPaidExpensesCount() {
        return fullyPaidExpensesCount;
    }

    public void setFullyPaidExpensesCount(int fullyPaidExpensesCount) {
        this.fullyPaidExpensesCount = fullyPaidExpensesCount;
    }

    public int getPendingExpensesCount() {
        return pendingExpensesCount;
    }

    public void setPendingExpensesCount(int pendingExpensesCount) {
        this.pendingExpensesCount = pendingExpensesCount;
    }

    public List<CategorySpendingItemDto> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<CategorySpendingItemDto> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public List<ParticipantSpendingItemDto> getParticipantBreakdown() {
        return participantBreakdown;
    }

    public void setParticipantBreakdown(List<ParticipantSpendingItemDto> participantBreakdown) {
        this.participantBreakdown = participantBreakdown;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}
