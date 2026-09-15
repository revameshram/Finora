package com.finora.portfolio.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * §6.3 Portfolio Growth Outlook inputs. Also used as the persisted-assumptions shape.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrowthOutlookRequest {

    @NotNull(message = "Expected yearly return % is required")
    @DecimalMin(value = "0.0", message = "Expected return must be >= 0")
    private BigDecimal expectedReturnPct;

    @NotNull(message = "Years ahead is required")
    @Min(value = 1, message = "Years must be at least 1")
    private Integer years;

    @NotNull(message = "Monthly savings is required")
    @DecimalMin(value = "0.0", message = "Monthly savings must be >= 0")
    private BigDecimal monthlySavings;

    /** Optional — when present, the response also carries an inflation-adjusted "real" series. */
    private BigDecimal inflationPct;
}
