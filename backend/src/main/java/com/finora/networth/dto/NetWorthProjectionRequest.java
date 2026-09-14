package com.finora.networth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NetWorthProjectionRequest {

    @Builder.Default
    private int years = 10;

    @Builder.Default
    private BigDecimal conservativeCagrPct = new BigDecimal("5.00");

    @Builder.Default
    private BigDecimal moderateCagrPct = new BigDecimal("10.00");

    @Builder.Default
    private BigDecimal aggressiveCagrPct = new BigDecimal("15.00");

    @Builder.Default
    private BigDecimal monthlySavingsContribution = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal inflationPct = new BigDecimal("6.00");
}
