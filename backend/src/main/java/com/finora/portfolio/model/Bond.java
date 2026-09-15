package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * The Date/Coupon/Capital/Payout/Status schedule (§6.5) is computed on demand, extending the
 * FD schedule-modal pattern to Bonds per Finora decision §6.6 #4 / §2.4.
 */
@Entity
@Table(name = "pt_bond")
@DiscriminatorValue("BOND")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Bond extends PortfolioAsset {

    @Column(length = 128)
    private String issuer;

    @Column(name = "face_value", nullable = false, precision = 18, scale = 2)
    private BigDecimal faceValue;

    @Column(name = "coupon_rate_pct", nullable = false, precision = 6, scale = 3)
    private BigDecimal couponRatePct;

    @Enumerated(EnumType.STRING)
    @Column(name = "coupon_frequency", nullable = false, length = 16)
    @Builder.Default
    private PaymentFrequency couponFrequency = PaymentFrequency.ANNUALLY;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "maturity_date", nullable = false)
    private LocalDate maturityDate;

    @Column(name = "purchase_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "current_price", precision = 18, scale = 2)
    private BigDecimal currentPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private BondStatus status = BondStatus.ACTIVE;

    @Override
    @Transient
    public AssetType getAssetType() {
        return AssetType.BOND;
    }
}
