package com.finora.fire.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireSummaryDto {

    private FirePlanDto plan;
    private FireCalculationResultDto calculation;
    private List<FireGrowthProjectionPointDto> projections;
    private List<FireNudgeDto> nudges;
}
