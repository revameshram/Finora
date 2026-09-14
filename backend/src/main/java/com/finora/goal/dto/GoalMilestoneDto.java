package com.finora.goal.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalMilestoneDto {

    private String id;
    private String goalId;
    private String label;
    private BigDecimal targetPct;
    private Boolean isAchieved;
    private LocalDateTime achievedAt;
    private LocalDateTime createdAt;
}
