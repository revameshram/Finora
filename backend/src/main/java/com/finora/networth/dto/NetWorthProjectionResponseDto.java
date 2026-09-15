package com.finora.networth.dto;

import com.finora.common.growth.GrowthProjectionPoint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NetWorthProjectionResponseDto {

    private BigDecimal currentNetWorth;
    private BigDecimal portfolioLinkedAssetsHeldFlat;
    private BigDecimal manualAssetsTotal;
    private BigDecimal totalLiabilities;

    private ScenarioProjectionDto conservativeScenario;
    private ScenarioProjectionDto moderateScenario;
    private ScenarioProjectionDto aggressiveScenario;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScenarioProjectionDto {
        private String scenarioName;
        private BigDecimal cagrPct;
        private Integer doublesInYears;
        private BigDecimal projectedNetWorthNominal;
        private BigDecimal projectedNetWorthReal;
        private List<GrowthProjectionPoint> yearlyPoints;
    }
}
