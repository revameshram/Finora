package com.finora.trip.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tr_category_budgets")
public class TripCategoryBudget {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TripCategory category;

    @Column(name = "budget_amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal budgetAmount = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public TripCategoryBudget() {
    }

    public TripCategoryBudget(String id, String tripId, TripCategory category, BigDecimal budgetAmount) {
        this.id = id;
        this.tripId = tripId;
        this.category = category;
        this.budgetAmount = budgetAmount != null ? budgetAmount : BigDecimal.ZERO;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTripId() {
        return tripId;
    }

    public void setTripId(String tripId) {
        this.tripId = tripId;
    }

    public TripCategory getCategory() {
        return category;
    }

    public void setCategory(TripCategory category) {
        this.category = category;
    }

    public BigDecimal getBudgetAmount() {
        return budgetAmount != null ? budgetAmount : BigDecimal.ZERO;
    }

    public void setBudgetAmount(BigDecimal budgetAmount) {
        this.budgetAmount = budgetAmount != null ? budgetAmount : BigDecimal.ZERO;
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
