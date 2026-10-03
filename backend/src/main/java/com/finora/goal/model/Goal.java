package com.finora.goal.model;

import com.finora.common.linking.model.LinkableEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gm_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Goal extends LinkableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private GoalCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private GoalPriority priority = GoalPriority.MEDIUM;

    @Column(name = "target_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal targetAmount;

    @Column(name = "target_is_future_value")
    @Builder.Default
    private Boolean targetIsFutureValue = false;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "inflation_rate_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal inflationRatePct = new BigDecimal("6.0");

    @Column(name = "expected_annual_return_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal expectedAnnualReturnPct = new BigDecimal("10.0");

    @Column(name = "contribution_frequency", length = 32)
    @Builder.Default
    private String contributionFrequency = "MONTHLY";

    @Column(name = "starting_balance", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal startingBalance = BigDecimal.ZERO;

    @Column(name = "account_label", length = 128)
    private String accountLabel;

    @Column(name = "current_value", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal currentValue = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private GoalStatus status = GoalStatus.ACTIVE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
