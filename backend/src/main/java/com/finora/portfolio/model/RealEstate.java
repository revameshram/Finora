package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pt_real_estate")
@DiscriminatorValue("REAL_ESTATE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RealEstate extends PortfolioAsset {

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false, length = 16)
    private PropertyType propertyType;

    @Column(length = 255)
    private String location;

    @Column(name = "purchase_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "current_estimated_value", nullable = false, precision = 18, scale = 2)
    private BigDecimal currentEstimatedValue;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Override
    @Transient
    public AssetType getAssetType() {
        return AssetType.REAL_ESTATE;
    }
}
