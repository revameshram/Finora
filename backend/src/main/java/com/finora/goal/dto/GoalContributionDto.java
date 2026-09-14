package com.finora.goal.dto;

import com.finora.goal.model.GoalContributionSourceType;
import com.finora.goal.model.GoalContributionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalContributionDto {

    private String id;
    private String goalId;
    private String goalName;
    private GoalContributionType type;
    private BigDecimal amount;
    private LocalDate date;
    private String note;
    private GoalContributionSourceType sourceType;
    private LocalDateTime createdAt;
}
