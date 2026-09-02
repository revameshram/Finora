package com.finora.expense.dto;

public class CreateNoteRequest {
    private String budgetMonth; // "YYYY-MM"
    private String content;

    public CreateNoteRequest() {
    }

    public CreateNoteRequest(String budgetMonth, String content) {
        this.budgetMonth = budgetMonth;
        this.content = content;
    }

    public String getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(String budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
