package com.finora.goal.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalNudgeDto {

    private String id;
    private String goalId;
    private String goalName;
    private String type; // "BEHIND_PACE", "CONTRIBUTE_REMINDER", "CAPACITY_OVERAGE", "COMPLETED_CELEBRATION"
    private String severity; // "CRITICAL", "WARNING", "INFO", "SUCCESS"
    private String title;
    private String message;
    private String actionLabel;
}
