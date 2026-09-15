package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * One row per user: persisted Growth Outlook slider assumptions (§6.3), with a Reset-to-default action.
 */
@Entity
@Table(name = "pt_growth_assumptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrowthAssumptions {

    @Id
    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "expected_return_pct", nullable = false, precision = 6, scale = 3)
    private BigDecimal expectedReturnPct;

    @Column(nullable = false)
    private Integer years;

    @Column(name = "monthly_savings", nullable = false, precision = 18, scale = 2)
    private BigDecimal monthlySavings;

    @Column(name = "inflation_pct", precision = 6, scale = 3)
    private BigDecimal inflationPct;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
