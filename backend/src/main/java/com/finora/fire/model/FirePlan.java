package com.finora.fire.model;

import com.finora.common.linking.model.LinkableEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "fp_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FirePlan extends LinkableEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_savings_source", nullable = false, length = 32)
    @Builder.Default
    private FireSavingsSource currentSavingsSource = FireSavingsSource.MANUAL;

    @Column(name = "manual_current_savings", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal manualCurrentSavings = BigDecimal.ZERO;

    @Column(name = "current_age")
    private Integer currentAge;

    @Column(name = "target_retirement_age")
    private Integer targetRetirementAge;

    @Column(name = "monthly_savings", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal monthlySavings = BigDecimal.ZERO;

    @Column(name = "expected_annual_return_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal expectedAnnualReturnPct = new BigDecimal("12.00");

    @Column(name = "post_retirement_return_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal postRetirementReturnPct = new BigDecimal("8.00");

    @Column(name = "annual_expenses_in_retirement", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal annualExpensesInRetirement = BigDecimal.ZERO;

    @Column(name = "safe_withdrawal_rate_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal safeWithdrawalRatePct = new BigDecimal("4.00");

    @Column(name = "expected_annual_inflation_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal expectedAnnualInflationPct = new BigDecimal("6.00");

    @Enumerated(EnumType.STRING)
    @Column(name = "active_mode", nullable = false, length = 32)
    @Builder.Default
    private FireCalculationMode activeMode = FireCalculationMode.YEARS_TO_FIRE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
