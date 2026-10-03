package com.finora.portfolio.service;

import com.finora.portfolio.model.AssetType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Internal, per-holding aggregation record used to unify all 9 asset-type tables for the
 * dashboard/growth/drawdown analytics without entangling computation logic into the entities
 * themselves (each type derives invested/current value differently — see PortfolioAssetService).
 */
@Getter
@Builder
public class AssetValuation {
    private String id;
    private AssetType assetType;
    private String name;
    /** MfCategory name for mutual funds, MetalType name for metals, PropertyType for real estate, else null. */
    private String category;
    private BigDecimal investedAmount;
    private BigDecimal currentValue;
    private boolean isIncluded;
    /** 0..1 fraction of currentValue that belongs to the "equity" bucket (1 for stocks/ETFs/equity-MF, partial for NPS, 0 otherwise). */
    private BigDecimal equityFraction;

    public BigDecimal gainLoss() {
        return currentValue.subtract(investedAmount);
    }
}
