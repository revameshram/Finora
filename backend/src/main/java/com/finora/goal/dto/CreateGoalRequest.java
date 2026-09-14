package com.finora.goal.dto;

import com.finora.goal.model.GoalCategory;
import com.finora.goal.model.GoalPriority;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoalRequest {

    private String name;
    private GoalCategory category;
    private GoalPriority priority;
    private BigDecimal targetAmount;
    private Boolean targetIsFutureValue;
    private LocalDate targetDate;
    private BigDecimal inflationRatePct;
    private BigDecimal expectedAnnualReturnPct;
    private String contributionFrequency;
    private BigDecimal startingBalance;
    private String accountLabel;
    private String notes;
    private List<String> linkedPortfolioAssetIds;
}
