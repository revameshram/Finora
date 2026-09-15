package com.finora.goal.dto;

import com.finora.goal.model.GoalContributionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateContributionRequest {

    private String goalId;
    private GoalContributionType type;
    private BigDecimal amount;
    private LocalDate date;
    private String note;
}
