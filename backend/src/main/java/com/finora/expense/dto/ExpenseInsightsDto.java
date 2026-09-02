package com.finora.expense.dto;

import java.math.BigDecimal;
import java.util.List;

public class ExpenseInsightsDto {
    private String budgetMonth;
    private int financialHealthScore; // 0 - 100
    private String healthBadge;        // e.g. "Excellent", "Good", "Needs Attention"
    private double savingsRate;        // %
    private double expenseRatio;       // %
    private double pendingRatio;       // %
    private BigDecimal emergencyFundTarget; // 6x average monthly outflow
    private BigDecimal largestIncomeAmount;
    private String largestIncomeName;
    private BigDecimal largestExpenseAmount;
    private String largestExpenseItem;
    private BigDecimal cashFlowVelocity; // net savings per day
    private List<String> recommendations;

    public ExpenseInsightsDto() {
    }

    public String getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(String budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public int getFinancialHealthScore() {
        return financialHealthScore;
    }

    public void setFinancialHealthScore(int financialHealthScore) {
        this.financialHealthScore = financialHealthScore;
    }

    public String getHealthBadge() {
        return healthBadge;
    }

    public void setHealthBadge(String healthBadge) {
        this.healthBadge = healthBadge;
    }

    public double getSavingsRate() {
        return savingsRate;
    }

    public void setSavingsRate(double savingsRate) {
        this.savingsRate = savingsRate;
    }

    public double getExpenseRatio() {
        return expenseRatio;
    }

    public void setExpenseRatio(double expenseRatio) {
        this.expenseRatio = expenseRatio;
    }

    public double getPendingRatio() {
        return pendingRatio;
    }

    public void setPendingRatio(double pendingRatio) {
        this.pendingRatio = pendingRatio;
    }

    public BigDecimal getEmergencyFundTarget() {
        return emergencyFundTarget;
    }

    public void setEmergencyFundTarget(BigDecimal emergencyFundTarget) {
        this.emergencyFundTarget = emergencyFundTarget;
    }

    public BigDecimal getLargestIncomeAmount() {
        return largestIncomeAmount;
    }

    public void setLargestIncomeAmount(BigDecimal largestIncomeAmount) {
        this.largestIncomeAmount = largestIncomeAmount;
    }

    public String getLargestIncomeName() {
        return largestIncomeName;
    }

    public void setLargestIncomeName(String largestIncomeName) {
        this.largestIncomeName = largestIncomeName;
    }

    public BigDecimal getLargestExpenseAmount() {
        return largestExpenseAmount;
    }

    public void setLargestExpenseAmount(BigDecimal largestExpenseAmount) {
        this.largestExpenseAmount = largestExpenseAmount;
    }

    public String getLargestExpenseItem() {
        return largestExpenseItem;
    }

    public void setLargestExpenseItem(String largestExpenseItem) {
        this.largestExpenseItem = largestExpenseItem;
    }

    public BigDecimal getCashFlowVelocity() {
        return cashFlowVelocity;
    }

    public void setCashFlowVelocity(BigDecimal cashFlowVelocity) {
        this.cashFlowVelocity = cashFlowVelocity;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}
