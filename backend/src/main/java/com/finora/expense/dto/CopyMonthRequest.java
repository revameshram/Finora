package com.finora.expense.dto;

public class CopyMonthRequest {
    private String fromMonth; // e.g. "2026-08"
    private String toMonth;   // e.g. "2026-09"
    private boolean copyIncome;
    private boolean copyTransactions;
    private boolean copyTasks;

    public CopyMonthRequest() {
        this.copyIncome = true;
        this.copyTransactions = true;
        this.copyTasks = true;
    }

    public CopyMonthRequest(String fromMonth, String toMonth, boolean copyIncome, boolean copyTransactions, boolean copyTasks) {
        this.fromMonth = fromMonth;
        this.toMonth = toMonth;
        this.copyIncome = copyIncome;
        this.copyTransactions = copyTransactions;
        this.copyTasks = copyTasks;
    }

    public String getFromMonth() {
        return fromMonth;
    }

    public void setFromMonth(String fromMonth) {
        this.fromMonth = fromMonth;
    }

    public String getToMonth() {
        return toMonth;
    }

    public void setToMonth(String toMonth) {
        this.toMonth = toMonth;
    }

    public boolean isCopyIncome() {
        return copyIncome;
    }

    public void setCopyIncome(boolean copyIncome) {
        this.copyIncome = copyIncome;
    }

    public boolean isCopyTransactions() {
        return copyTransactions;
    }

    public void setCopyTransactions(boolean copyTransactions) {
        this.copyTransactions = copyTransactions;
    }

    public boolean isCopyTasks() {
        return copyTasks;
    }

    public void setCopyTasks(boolean copyTasks) {
        this.copyTasks = copyTasks;
    }
}
