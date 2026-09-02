package com.finora.expense.dto;

import java.math.BigDecimal;

public class CreateIncomeRequest {
    private String budgetMonth; // "YYYY-MM"
    private String name;
    private BigDecimal amount;
    private String instrument;

    public CreateIncomeRequest() {
    }

    public CreateIncomeRequest(String budgetMonth, String name, BigDecimal amount, String instrument) {
        this.budgetMonth = budgetMonth;
        this.name = name;
        this.amount = amount;
        this.instrument = instrument;
    }

    public String getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(String budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getInstrument() {
        return instrument;
    }

    public void setInstrument(String instrument) {
        this.instrument = instrument;
    }
}
