package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * §6.2 Dashboard aggregation response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioDashboardDto {

    private BigDecimal presentValue;
    private BigDecimal totalInvested;
    private BigDecimal overallGainLoss;
    private BigDecimal overallGainLossPct;
    private int portfolioCompositionCount;

    private HighestMoverDto highestProfitHolding;
    private HighestMoverDto highestLossHolding;

    private BigDecimal oneDayChangeAmount;
    private BigDecimal oneDayChangePct;

    /** Debt / Equity / Others 3-way split. */
    private List<BreakdownEntryDto> assetAllocation;

    private List<BreakdownEntryDto> portfolioByCategory;
    private List<BreakdownEntryDto> mutualFundByCategory;
    private List<BreakdownEntryDto> mutualFundByCapitalisation;

    private NpsAllocationSummaryDto npsSchemeAllocation;
    private MetalsMiniPanelDto metalsMiniPanel;

    private List<GrowthChartPointDto> growthChartSeries;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BreakdownEntryDto {
        private String label;
        private BigDecimal amount;
        private BigDecimal percentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HighestMoverDto {
        private String holdingId;
        private String name;
        private BigDecimal gainLoss;
        private BigDecimal gainLossPct;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NpsAllocationSummaryDto {
        private BigDecimal equityPct;
        private BigDecimal corporateDebtPct;
        private BigDecimal governmentSecuritiesPct;
        private BigDecimal alternativePct;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetalsMiniPanelDto {
        private BigDecimal totalInvested;
        private BigDecimal totalValue;
        private BigDecimal gainLoss;
        private List<BreakdownEntryDto> byMetalType;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GrowthChartPointDto {
        private LocalDate date;
        private BigDecimal invested;
        private BigDecimal worth;
    }
}
