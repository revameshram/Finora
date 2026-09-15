package com.finora.goal.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gm_investment_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalInvestmentLink {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "goal_id", nullable = false, length = 64)
    private String goalId;

    @Column(name = "portfolio_asset_id", nullable = false, length = 64)
    private String portfolioAssetId;

    @Column(name = "linked_profile_id", nullable = false, length = 64)
    private String linkedProfileId;

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
