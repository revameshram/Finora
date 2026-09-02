package com.finora.trip.dto;

import com.finora.trip.model.TripCategory;
import java.math.BigDecimal;

public class SetCategoryBudgetRequest {
    private TripCategory category;
    private BigDecimal budgetAmount;

    public SetCategoryBudgetRequest() {
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
}
