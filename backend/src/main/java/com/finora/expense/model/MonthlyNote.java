package com.finora.expense.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "et_notes")
public class MonthlyNote {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "profile_id", length = 64, nullable = false)
    private String profileId;

    @Column(name = "budget_month", length = 7, nullable = false)
    private String budgetMonth;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public MonthlyNote() {
    }

    public MonthlyNote(String id, String profileId, String budgetMonth, String content) {
        this.id = id;
        this.profileId = profileId;
        this.budgetMonth = budgetMonth;
        this.content = content;
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
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
