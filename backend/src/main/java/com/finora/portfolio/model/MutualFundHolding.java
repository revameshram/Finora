package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pt_mutual_fund_holding")
@DiscriminatorValue("MUTUAL_FUND")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MutualFundHolding extends PortfolioAsset {

    @Column(name = "scheme_code", nullable = false, length = 32)
    private String schemeCode;

    @Column(name = "scheme_name", nullable = false, length = 255)
    private String schemeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private MfCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private Capitalisation capitalisation;

    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal units;

    @Column(name = "avg_nav", nullable = false, precision = 18, scale = 4)
    private BigDecimal avgNav;

    @Column(name = "invested_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal investedAmount;

    @Column(name = "current_nav", precision = 18, scale = 4)
    private BigDecimal currentNav;

    @Column(name = "last_price_update")
    private LocalDateTime lastPriceUpdate;

    @Column(name = "price_is_live", nullable = false)
    @Builder.Default
    private boolean priceIsLive = false;

    @Override
    @Transient
    public AssetType getAssetType() {
        return AssetType.MUTUAL_FUND;
    }
}
