package com.finora.common.linking.model;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class LinkableEntity implements Linkable {

    /**
     * Controls whether this record is actively computed in rollups/totals.
     * If false, the record remains visible but is excluded from aggregates.
     */
    @Column(name = "is_included", nullable = false)
    @lombok.Builder.Default
    private boolean isIncluded = true;

    /**
     * Indicates whether this record originates from and synchronizes with an external module.
     */
    @Column(name = "is_linked", nullable = false)
    @lombok.Builder.Default
    private boolean isLinked = false;

    /**
     * Specifies the upstream source module that created or owns the linked record.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "source_module", length = 32, nullable = false)
    @lombok.Builder.Default
    private SourceModule sourceModule = SourceModule.MANUAL;

    /**
     * Pointer to the primary key / ID of the originating record in the upstream module table.
     */
    @Column(name = "source_entity_id", length = 64)
    private String sourceEntityId;

    /**
     * Timestamp when the cross-module link was established.
     */
    @Column(name = "linked_at")
    private LocalDateTime linkedAt;

    /**
     * Delink decision implementation: Converts the linked record into an independent
     * standalone MANUAL copy with its current frozen values, clearing the source link pointer.
     */
    @Override
    public void delink() {
        this.isLinked = false;
        this.sourceModule = SourceModule.MANUAL;
        this.sourceEntityId = null;
    }

    @Override
    public void toggleIncluded() {
        this.isIncluded = !this.isIncluded;
    }
}
