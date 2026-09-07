package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Indian (NSE) and US-listed stocks share this table via the {@link Market} flag — the Master Reference's
 * asset-class list treats "US Stocks" as a pricing/display variant of Stocks, not a distinct schema entry.
 */
@Entity
@Table(name = "pt_stock_holding")
@DiscriminatorValue("STOCK")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class StockHolding extends PortfolioAsset {

    @Column(nullable = false, length = 32)
    private String ticker;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Market market;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal quantity;

    @Column(name = "avg_cost_per_unit", nullable = false, precision = 18, scale = 4)
    private BigDecimal avgCostPerUnit;

    @Column(name = "invested_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal investedAmount;

    @Column(name = "current_price", precision = 18, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "last_price_update")
    private LocalDateTime lastPriceUpdate;

    @Column(name = "price_is_live", nullable = false)
    @Builder.Default
    private boolean priceIsLive = false;

    @Override
    @Transient
    public AssetType getAssetType() {
        return AssetType.STOCK;
    }
}
