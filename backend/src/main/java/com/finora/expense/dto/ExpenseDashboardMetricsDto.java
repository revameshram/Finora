package com.finora.expense.dto;

import java.math.BigDecimal;

public class ExpenseDashboardMetricsDto {
    private String budgetMonth;
    private BigDecimal totalInflow;      // Sum of Income
    private BigDecimal totalOutflow;     // Sum of Transactions (Pending + Done, where isIncluded = true)
    private BigDecimal cashFlow;         // totalInflow - totalOutflow (committed)
    private BigDecimal netPosition;      // totalInflow - sum(Done transactions) (settled)
    private BigDecimal pendingOutflow;   // sum(Pending transactions)
    private int completedTransactionsCount;
    private int pendingTransactionsCount;
    private int totalIncomeSourcesCount;

    public ExpenseDashboardMetricsDto() {
    }

    public ExpenseDashboardMetricsDto(String budgetMonth, BigDecimal totalInflow, BigDecimal totalOutflow, BigDecimal cashFlow, BigDecimal netPosition, BigDecimal pendingOutflow, int completedTransactionsCount, int pendingTransactionsCount, int totalIncomeSourcesCount) {
        this.budgetMonth = budgetMonth;
        this.totalInflow = totalInflow;
        this.totalOutflow = totalOutflow;
        this.cashFlow = cashFlow;
        this.netPosition = netPosition;
        this.pendingOutflow = pendingOutflow;
        this.completedTransactionsCount = completedTransactionsCount;
        this.pendingTransactionsCount = pendingTransactionsCount;
        this.totalIncomeSourcesCount = totalIncomeSourcesCount;
    }

    public String getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(String budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public BigDecimal getTotalInflow() {
        return totalInflow;
    }

    public void setTotalInflow(BigDecimal totalInflow) {
        this.totalInflow = totalInflow;
    }

    public BigDecimal getTotalOutflow() {
        return totalOutflow;
    }

    public void setTotalOutflow(BigDecimal totalOutflow) {
        this.totalOutflow = totalOutflow;
    }

    public BigDecimal getCashFlow() {
        return cashFlow;
    }

    public void setCashFlow(BigDecimal cashFlow) {
        this.cashFlow = cashFlow;
    }

    public BigDecimal getNetPosition() {
        return netPosition;
    }

    public void setNetPosition(BigDecimal netPosition) {
        this.netPosition = netPosition;
    }

    public BigDecimal getPendingOutflow() {
        return pendingOutflow;
    }

    public void setPendingOutflow(BigDecimal pendingOutflow) {
        this.pendingOutflow = pendingOutflow;
    }

    public int getCompletedTransactionsCount() {
        return completedTransactionsCount;
    }

    public void setCompletedTransactionsCount(int completedTransactionsCount) {
        this.completedTransactionsCount = completedTransactionsCount;
    }

    public int getPendingTransactionsCount() {
        return pendingTransactionsCount;
    }

    public void setPendingTransactionsCount(int pendingTransactionsCount) {
        this.pendingTransactionsCount = pendingTransactionsCount;
    }

    public int getTotalIncomeSourcesCount() {
        return totalIncomeSourcesCount;
    }

    public void setTotalIncomeSourcesCount(int totalIncomeSourcesCount) {
        this.totalIncomeSourcesCount = totalIncomeSourcesCount;
    }
}
