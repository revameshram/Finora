package com.finora.common.growth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Standardized data point representing nominal and inflation-adjusted (real) future values
 * across a projected time horizon.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrowthProjectionPoint {

    private int year;
    private BigDecimal nominalValue;
    private BigDecimal realValue;
    private BigDecimal cumulativeContributions;
    private BigDecimal interestEarned;
}
