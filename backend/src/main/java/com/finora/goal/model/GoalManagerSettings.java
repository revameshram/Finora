package com.finora.goal.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gm_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalManagerSettings {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 64)
    private String userId;

    @Column(name = "monthly_savings_capacity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal monthlySavingsCapacity = new BigDecimal("50000.0000");

    @Column(name = "behind_schedule_threshold_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal behindScheduleThresholdPct = new BigDecimal("10.00");

    @Column(name = "default_inflation_rate_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal defaultInflationRatePct = new BigDecimal("6.00");

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void ensureId() {
        if (this.id == null || this.id.isBlank()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
