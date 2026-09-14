package com.finora.goal.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDetailResponse {

    private GoalDto goal;
    private List<GoalContributionDto> history;
    private List<GoalMilestoneDto> milestones;
    private List<GoalTrajectoryPointDto> trajectory;
    private List<String> linkedPortfolioAssetIds;
}
