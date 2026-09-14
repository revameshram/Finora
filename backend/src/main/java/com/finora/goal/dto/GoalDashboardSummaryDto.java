package com.finora.goal.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDashboardSummaryDto {

    private BigDecimal totalSavedAmount;
    private BigDecimal totalTargetAmount;
    private BigDecimal totalAdjustedFutureValue;
    private BigDecimal overallProgressPercentage;
    private Integer activeGoalsCount;
    private Integer onTrackCount;
    private Integer behindCount;
    private BigDecimal totalRequiredMonthlyContribution;
    private BigDecimal monthlySavingsCapacity;
    private Boolean isOverCapacity;
    private BigDecimal capacityOverageAmount;
    private String nextDueGoalName;
    private Long nextDueDays;

    private List<GoalDto> goals;
    private Map<String, BigDecimal> allocationByCategory;
    private List<GoalNudgeDto> nudges;
}
