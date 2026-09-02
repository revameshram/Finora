package com.finora.expense.contract.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "High-level monthly expense and annual spend summary consumed by Goal Manager & FIRE Planner")
public class ExpenseSummaryDto {

    @Schema(description = "Period in YYYY-MM format", example = "2026-08")
    private String period;

    @Schema(description = "Total monthly income in base INR", example = "185000.00")
    private BigDecimal totalIncome;

    @Schema(description = "Total monthly outflow in base INR", example = "92500.00")
    private BigDecimal totalOutflow;

    @Schema(description = "Net monthly savings in base INR (income - outflow)", example = "92500.00")
    private BigDecimal netSavings;

    @Schema(description = "Monthly savings rate percentage", example = "50.00")
    private BigDecimal savingsRate;

    @Schema(description = "Trailing 12-month average monthly spend in base INR", example = "87500.00")
    private BigDecimal averageMonthlySpend;

    @Schema(description = "Trailing 12-month annual spend in base INR (essential for FIRE 25x/33x calculations)", example = "1050000.00")
    private BigDecimal trailing12MonthAnnualSpend;

    @Schema(description = "Base currency code", example = "INR")
    @Builder.Default
    private String currency = "INR";

    @Schema(description = "Top spending categories breakdown")
    private List<CategoryBreakdownDto> topCategories;
}
