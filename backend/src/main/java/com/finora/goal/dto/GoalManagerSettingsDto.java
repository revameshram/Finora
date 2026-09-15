package com.finora.goal.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalManagerSettingsDto {

    private String id;
    private String userId;
    private BigDecimal monthlySavingsCapacity;
    private BigDecimal behindScheduleThresholdPct;
    private BigDecimal defaultInflationRatePct;
}
