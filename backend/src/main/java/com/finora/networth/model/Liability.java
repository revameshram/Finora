package com.finora.networth.model;

import com.finora.common.linking.model.LinkableEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "nw_liabilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Liability extends LinkableEntity {

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private LiabilityCategory category;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "incurred_date")
    private LocalDate incurredDate;

    @Column(name = "interest_rate_pct", precision = 5, scale = 2)
    private BigDecimal interestRatePct;

    @Column(name = "recurring_payment", precision = 19, scale = 4)
    private BigDecimal recurringPayment;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
