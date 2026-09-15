package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "pt_other_instrument")
@DiscriminatorValue("OTHER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class OtherInstrument extends PortfolioAsset {

    @Column(length = 128)
    private String category;

    @Column(name = "invested_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal investedAmount;

    @Column(name = "current_value", nullable = false, precision = 18, scale = 2)
    private BigDecimal currentValue;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Override
    @Transient
    public AssetType getAssetType() {
        return AssetType.OTHER;
    }
}
