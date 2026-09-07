package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * FD/RD. The Date/Deposit/Earned-Interest/Capital/Status schedule shown in the detail modal (§6.5)
 * is computed on demand from these fields, not persisted row-by-row.
 */
@Entity
@Table(name = "pt_deposit")
@DiscriminatorValue("DEPOSIT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Deposit extends PortfolioAsset {

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_type", nullable = false, length = 16)
    private DepositType depositType;

    @Column(name = "bank_name", length = 128)
    private String bankName;

    @Column(name = "principal_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "interest_rate_pct", nullable = false, precision = 6, scale = 3)
    private BigDecimal interestRatePct;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "maturity_date", nullable = false)
    private LocalDate maturityDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "compounding_frequency", nullable = false, length = 16)
    @Builder.Default
    private PaymentFrequency compoundingFrequency = PaymentFrequency.QUARTERLY;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private DepositStatus status = DepositStatus.ACTIVE;

    @Override
    @Transient
    public AssetType getAssetType() {
        return AssetType.DEPOSIT;
    }
}
