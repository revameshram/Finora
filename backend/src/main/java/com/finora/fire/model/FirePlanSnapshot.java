package com.finora.fire.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fp_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirePlanSnapshot {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "fire_plan_id", nullable = false, length = 64)
    private String firePlanId;

    @Column(name = "computed_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime computedAt = LocalDateTime.now();

    @Column(name = "fire_number", nullable = false, precision = 19, scale = 4)
    private BigDecimal fireNumber;

    @Column(name = "years_to_fire", precision = 5, scale = 2)
    private BigDecimal yearsToFire;

    @Column(name = "required_monthly_savings", precision = 19, scale = 4)
    private BigDecimal requiredMonthlySavings;

    @PrePersist
    public void ensureId() {
        if (this.id == null || this.id.isBlank()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.computedAt == null) {
            this.computedAt = LocalDateTime.now();
        }
    }
}
