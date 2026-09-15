package com.finora.portfolio.model;

import com.finora.common.linking.model.LinkableEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Base of the JOINED-table-inheritance hierarchy (§6.7): id, userId, asset_type discriminator, name, timestamps.
 * Extends LinkableEntity for consistency with every other module's core entity (gives holdings the standard
 * isIncluded toggle), even though nothing links INTO Portfolio Tracker yet — sourceModule stays MANUAL always.
 */
@Entity
@Table(name = "pt_asset")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "asset_type", discriminatorType = DiscriminatorType.STRING, length = 32)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class PortfolioAsset extends LinkableEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Fixed per concrete subclass — mirrors the discriminator without an extra mapped column.
     */
    @Transient
    public abstract AssetType getAssetType();
}
