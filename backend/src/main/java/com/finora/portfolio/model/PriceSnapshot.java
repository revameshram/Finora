package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * One row per holding per calendar day (upserted whenever prices are refreshed). Gives the
 * dashboard's 1D change and invested-vs-worth-today growth chart (§6.2) something to diff against
 * instead of just today's point.
 */
@Entity
@Table(name = "pt_price_snapshot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceSnapshot {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "holding_id", nullable = false, length = 64)
    private String holdingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 32)
    private AssetType assetType;

    @Column(name = "invested_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal investedAmount;

    @Column(name = "current_value", nullable = false, precision = 18, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "captured_date", nullable = false)
    private LocalDate capturedDate;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
