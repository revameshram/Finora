package com.finora.goal.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gm_tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalTag {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "goal_id", nullable = false, length = 64)
    private String goalId;

    @Column(name = "expense_transaction_id", nullable = false, length = 64)
    private String expenseTransactionId;

    @Column(name = "tagged_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime taggedAt = LocalDateTime.now();

    @PrePersist
    public void ensureId() {
        if (this.id == null || this.id.isBlank()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.taggedAt == null) {
            this.taggedAt = LocalDateTime.now();
        }
    }
}
