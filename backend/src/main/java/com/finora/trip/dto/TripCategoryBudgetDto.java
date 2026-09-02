package com.finora.trip.dto;

import com.finora.trip.model.TripCategory;
import java.math.BigDecimal;

public class TripCategoryBudgetDto {
    private String id;
    private String tripId;
    private TripCategory category;
    private BigDecimal budgetAmount;
    private BigDecimal actualSpent;
    private BigDecimal utilizationPercent; // Null-guarded

    public TripCategoryBudgetDto() {
    }

    public TripCategoryBudgetDto(String id, String tripId, TripCategory category, BigDecimal budgetAmount, BigDecimal actualSpent, BigDecimal utilizationPercent) {
        this.id = id;
        this.tripId = tripId;
        this.category = category;
        this.budgetAmount = budgetAmount != null ? budgetAmount : BigDecimal.ZERO;
        this.actualSpent = actualSpent != null ? actualSpent : BigDecimal.ZERO;
        this.utilizationPercent = utilizationPercent != null ? utilizationPercent : BigDecimal.ZERO;
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
        return budgetAmount;
    }

    public void setBudgetAmount(BigDecimal budgetAmount) {
        this.budgetAmount = budgetAmount;
    }

    public BigDecimal getActualSpent() {
        return actualSpent;
    }

    public void setActualSpent(BigDecimal actualSpent) {
        this.actualSpent = actualSpent;
    }

    public BigDecimal getUtilizationPercent() {
        return utilizationPercent;
    }

    public void setUtilizationPercent(BigDecimal utilizationPercent) {
        this.utilizationPercent = utilizationPercent;
    }
}
