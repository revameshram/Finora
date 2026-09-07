package com.finora.portfolio.dto;

import com.finora.portfolio.model.AssetType;
import lombok.*;

import java.math.BigDecimal;

/**
 * Read-only shape exposed at GET /api/v1/portfolio/summary for the not-yet-built Net Worth
 * Tracker's "Link Investments" and Goal Manager's future linking (§6.6 decision #6).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioHoldingSummaryDto {
    private String id;
    private String name;
    private AssetType assetType;
    private String category;
    private BigDecimal currentValue;
    private boolean isIncluded;
}
