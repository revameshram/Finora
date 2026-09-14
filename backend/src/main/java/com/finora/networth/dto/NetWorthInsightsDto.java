package com.finora.networth.dto;

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
public class NetWorthInsightsDto {

    private Integer healthScore;
    private String healthBadge;
    private BigDecimal debtToAssetRatioPct;
    private String debtToAssetStatus;
    private BigDecimal liquidityRatioPct;
    private String liquidityStatus;
    private TopHoldingDto largestAsset;
    private TopHoldingDto largestLiability;
    private List<RecommendationCardDto> recommendations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationCardDto {
        private String type; // positive, warning, neutral, critical
        private String title;
        private String description;
        private String actionLabel;
        private String actionModule;
    }
}
