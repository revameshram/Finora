package com.finora.goal.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalTrajectoryPointDto {

    private LocalDate date;
    private BigDecimal plannedAmount;
    private BigDecimal actualAmount;
    private BigDecimal gapAmount;
    private BigDecimal gapPercentage;
}
