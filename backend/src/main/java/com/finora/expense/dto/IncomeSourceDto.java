package com.finora.expense.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class IncomeSourceDto {
    private String id;
    private String profileId;
    private String budgetMonth;
    private String name;
    private BigDecimal amount;
    private String instrument;
    private Instant createdAt;
    private Instant updatedAt;

    public IncomeSourceDto() {
    }

    public IncomeSourceDto(String id, String profileId, String budgetMonth, String name, BigDecimal amount, String instrument, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.profileId = profileId;
        this.budgetMonth = budgetMonth;
        this.name = name;
        this.amount = amount;
        this.instrument = instrument;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProfileId() {
        return profileId;
    }

    public void setProfileId(String profileId) {
        this.profileId = profileId;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
