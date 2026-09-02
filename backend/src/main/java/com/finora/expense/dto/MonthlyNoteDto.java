package com.finora.expense.dto;

import java.time.Instant;

public class MonthlyNoteDto {
    private String id;
    private String profileId;
    private String budgetMonth;
    private String content;
    private Instant createdAt;

    public MonthlyNoteDto() {
    }

    public MonthlyNoteDto(String id, String profileId, String budgetMonth, String content, Instant createdAt) {
        this.id = id;
        this.profileId = profileId;
        this.budgetMonth = budgetMonth;
        this.content = content;
        this.createdAt = createdAt;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
