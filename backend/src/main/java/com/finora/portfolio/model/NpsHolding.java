package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * NPS/UPS holding. No reliable free live-NAV API exists for NPS scheme NAVs, so pricing is manual
 * (user-entered currentNav), same as Deposits/Bonds/Real Estate/Others.
 */
@Entity
@Table(name = "pt_nps_holding")
@DiscriminatorValue("NPS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class NpsHolding extends PortfolioAsset {

    @Column(name = "pension_fund_manager", length = 128)
    private String pensionFundManager;

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

    @Override
    @Transient
    public AssetType getAssetType() {
        return AssetType.NPS;
    }
}
