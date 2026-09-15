package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pt_metal_holding")
@DiscriminatorValue("METAL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MetalHolding extends PortfolioAsset {

    @Enumerated(EnumType.STRING)
    @Column(name = "metal_type", nullable = false, length = 16)
    private MetalType metalType;

    @Column(name = "purity_karat")
    private Integer purityKarat;

    @Column(name = "quantity_grams", nullable = false, precision = 18, scale = 4)
    private BigDecimal quantityGrams;

    @Column(name = "avg_cost_per_gram", nullable = false, precision = 18, scale = 4)
    private BigDecimal avgCostPerGram;

    @Column(name = "invested_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal investedAmount;

    @Column(name = "current_price_per_gram", precision = 18, scale = 4)
    private BigDecimal currentPricePerGram;

    @Column(name = "last_price_update")
    private LocalDateTime lastPriceUpdate;

    @Column(name = "price_is_live", nullable = false)
    @Builder.Default
    private boolean priceIsLive = false;

    @Override
    @Transient
    public AssetType getAssetType() {
        return AssetType.METAL;
    }
}
