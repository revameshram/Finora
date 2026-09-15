package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * One row per allocation bucket for an Others instrument's Category Mix splitter (§6.5).
 * Service layer validates that percentages for a given otherInstrumentId sum to 100.0.
 */
@Entity
@Table(name = "pt_other_instrument_category_mix")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtherInstrumentCategoryMix {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "other_instrument_id", nullable = false, length = 64)
    private String otherInstrumentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CategoryMixBucket bucket;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;
}
