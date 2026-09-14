package com.finora.goal.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gm_contributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalContribution {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "goal_id", nullable = false, length = 64)
    private String goalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "contribution_type", nullable = false, length = 32)
    @Builder.Default
    private GoalContributionType type = GoalContributionType.CONTRIBUTION;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "contribution_date", nullable = false)
    private LocalDate date;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 32)
    @Builder.Default
    private GoalContributionSourceType sourceType = GoalContributionSourceType.MANUAL;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void ensureId() {
        if (this.id == null || this.id.isBlank()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
