package com.finora.insights.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Full Suite-Wide Insights payload across all financial life areas")
public class SuiteInsightsDto {

    @Schema(description = "Composite Financial Health Score & 4 Pillar breakdown")
    private FinancialHealthScoreDto healthScore;

    @Schema(description = "Key metrics grouped across life areas")
    private List<KeyMetricItemDto> keyMetrics;

    @Schema(description = "Strategic action recommendations and cross-module nudges")
    private List<RecommendationNudgeDto> recommendations;

    @Schema(description = "Asset allocation breakdown percentages (Equities, Debt, Real Estate, Bullion, Cash)")
    private Map<String, BigDecimal> assetAllocationDistribution;

    @Schema(description = "Financial momentum summary")
    private String executiveSummary;
}
