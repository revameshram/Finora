package com.finora.portfolio.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * The "Add Shares" variant on an existing Stock/ETF holding (§6.5) — recomputes the
 * weighted-average cost rather than overwriting it.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddSharesRequest {

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    private BigDecimal costPerUnit;

    @Builder.Default
    private boolean useLivePriceAsPurchasePrice = false;
}
