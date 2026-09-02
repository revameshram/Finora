package com.finora.common.linking.model;

import java.time.LocalDateTime;

public interface Linkable {

    boolean isIncluded();

    void setIncluded(boolean included);

    boolean isLinked();

    void setLinked(boolean linked);

    SourceModule getSourceModule();

    void setSourceModule(SourceModule sourceModule);

    String getSourceEntityId();

    void setSourceEntityId(String sourceEntityId);

    LocalDateTime getLinkedAt();

    void setLinkedAt(LocalDateTime linkedAt);

    /**
     * Converts a linked record into an independent standalone manual copy with frozen current values.
     */
    default void delink() {
        setLinked(false);
        setSourceModule(SourceModule.MANUAL);
        setSourceEntityId(null);
    }

    default void toggleIncluded() {
        setIncluded(!isIncluded());
    }
}
