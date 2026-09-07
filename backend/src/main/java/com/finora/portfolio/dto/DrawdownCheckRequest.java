package com.finora.portfolio.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * §6.4 Equity Drawdown Check inputs.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrawdownCheckRequest {

    @NotNull(message = "Drop percentage is required")
    @DecimalMin(value = "0.0", message = "Drop % must be >= 0")
    @DecimalMax(value = "100.0", message = "Drop % must be <= 100")
    private BigDecimal dropPct;

    @NotNull(message = "Assumed recovery return % is required")
    @DecimalMin(value = "0.0", message = "Recovery return % must be >= 0")
    private BigDecimal recoveryReturnPct;
}
