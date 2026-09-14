package com.finora.networth.model;

import com.finora.common.linking.model.LinkableEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "nw_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Asset extends LinkableEntity {

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private AssetCategory category;

    @Column(name = "asset_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal value;

    @Column(name = "acquired_date")
    private LocalDate acquiredDate;

    @Column(name = "growth_rate_pct", precision = 5, scale = 2)
    private BigDecimal growthRatePct;

    @Column(name = "recurring_investment", precision = 19, scale = 4)
    private BigDecimal recurringInvestment;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
