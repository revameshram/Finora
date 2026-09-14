package com.finora.goal.dto;

import com.finora.goal.model.GoalCategory;
import com.finora.goal.model.GoalPriority;
import com.finora.goal.model.GoalStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDto {

    private String id;
    private String userId;
    private String name;
    private GoalCategory category;
    private GoalPriority priority;
    private BigDecimal targetAmount;
    private Boolean targetIsFutureValue;
    private BigDecimal adjustedFutureValue;
    private LocalDate targetDate;
    private Long daysRemaining;
    private BigDecimal inflationRatePct;
    private BigDecimal expectedAnnualReturnPct;
    private String contributionFrequency;
    private BigDecimal startingBalance;
    private String accountLabel;
    private BigDecimal currentValue;
    private BigDecimal linkedInvestmentsValue;
    private BigDecimal manualSavedValue;
    private BigDecimal progressPercentage;
    private BigDecimal requiredMonthlyContribution;
    private GoalStatus status;
    private String notes;
    private Boolean isIncluded;
    private Boolean isLinked;
    private String sourceModule;
    private String sourceEntityId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
