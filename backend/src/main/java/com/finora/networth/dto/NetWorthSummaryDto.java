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
public class NetWorthSummaryDto {

    private BigDecimal totalAssets;
    private BigDecimal manualAssetsTotal;
    private BigDecimal portfolioLinkedAssetsTotal;
    private BigDecimal totalLiabilities;
    private BigDecimal netWorth;
    private BigDecimal thirtyDayVelocity;
    private BigDecimal debtToAssetRatioPct;
    private BigDecimal liquidityRatioPct;
    private Integer healthScore;

    private List<CategoryBreakdownDto> assetsByCategory;
    private List<CategoryBreakdownDto> liabilitiesByCategory;
    private List<TopHoldingDto> topAssets;
    private List<TopHoldingDto> topLiabilities;
}
