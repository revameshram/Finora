package com.finora.insights.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Composite 0-100 Financial Health Score and 4 pillar sub-scores")
public class FinancialHealthScoreDto {

    @Schema(description = "Overall composite score between 0 and 100", example = "84")
    private int overallScore;

    @Schema(description = "Status tier: Flourishing, Strong, Moderate, Needs Attention", example = "Strong")
    private String statusTier;

    @Schema(description = "Headline summary of financial health", example = "Your overall balance sheet and savings velocity are in excellent standing.")
    private String summary;

    @Schema(description = "Cash Flow Health pillar score (0-100, 30% weight)", example = "88")
    private int cashFlowScore;

    @Schema(description = "Balance Sheet Solvency pillar score (0-100, 30% weight)", example = "82")
    private int solvencyScore;

    @Schema(description = "Goal Planning & Pacing pillar score (0-100, 20% weight)", example = "78")
    private int goalPacingScore;

    @Schema(description = "Retirement Freedom & Wealth Momentum pillar score (0-100, 20% weight)", example = "85")
    private int retirementReadinessScore;

    @Schema(description = "Monthly savings rate %", example = "53.8")
    private BigDecimal savingsRatePct;

    @Schema(description = "Debt-to-Asset ratio %", example = "24.5")
    private BigDecimal debtToAssetRatioPct;

    @Schema(description = "Emergency liquid runway in months", example = "7.2")
    private BigDecimal emergencyRunwayMonths;
}
