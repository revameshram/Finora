package com.finora.insights.dto;

import com.finora.common.linking.model.SourceModule;
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
@Schema(description = "Single cross-module metric card tagged with source module")
public class KeyMetricItemDto {

    @Schema(description = "Metric unique identifier", example = "net_worth")
    private String id;

    @Schema(description = "Life Area group: CASH_FLOW, DEBT, WEALTH, LIFE_ADMIN", example = "WEALTH")
    private String lifeArea;

    @Schema(description = "Human-readable label", example = "Consolidated Net Worth")
    private String label;

    @Schema(description = "Primary numeric or formatted value", example = "8870000.00")
    private BigDecimal rawValue;

    @Schema(description = "Formatted display value", example = "₹88,70,000")
    private String displayValue;

    @Schema(description = "Contextual subtext or comparison", example = "+18.4% YoY Growth")
    private String subtext;

    @Schema(description = "Trend direction: POSITIVE, NEGATIVE, NEUTRAL", example = "POSITIVE")
    private String trend;

    @Schema(description = "Source module originating this data", example = "NET_WORTH")
    private SourceModule sourceModule;

    @Schema(description = "Navigation shortcut for UI", example = "net-worth-tracker")
    private String targetModuleRoute;
}
