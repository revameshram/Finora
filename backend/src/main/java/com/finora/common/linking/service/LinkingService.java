package com.finora.common.linking.service;

import com.finora.common.linking.model.Linkable;
import com.finora.common.linking.model.SourceModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.function.Function;

@Slf4j
@Service
public class LinkingService {

    /**
     * Establishes a cross-module link on an entity.
     */
    public <T extends Linkable> T link(T target, SourceModule sourceModule, String sourceEntityId) {
        target.setLinked(true);
        target.setSourceModule(sourceModule);
        target.setSourceEntityId(sourceEntityId);
        target.setLinkedAt(LocalDateTime.now());
        log.info("Linked record with source {} (ID: {})", sourceModule, sourceEntityId);
        return target;
    }

    /**
     * Delinks a record per the documented decision: converts to standalone MANUAL copy.
     */
    public <T extends Linkable> T delink(T target) {
        String prevSource = target.getSourceModule().name();
        String prevId = target.getSourceEntityId();
        target.delink();
        log.info("Delinked record from source {} (ID: {}). It is now a standalone MANUAL entry.", prevSource, prevId);
        return target;
    }

    /**
     * Helper to compute total sum for a collection of Linkable items, respecting isIncluded flag.
     */
    public <T extends Linkable> BigDecimal calculateIncludedSum(
            Collection<T> items,
            Function<T, BigDecimal> amountExtractor) {

        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return items.stream()
                .filter(Linkable::isIncluded)
                .map(amountExtractor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
