package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrawdownCheckResponseDto {
    private BigDecimal equityBeforeDrop;
    private BigDecimal equityAfterDrop;
    private BigDecimal equityLoss;
    private BigDecimal portfolioValueBeforeDrop;
    private BigDecimal portfolioValueAfterDrop;
    private BigDecimal portfolioLevelImpactPct;

    /** Rough years-to-recover estimate at the given recovery return %, compounding the loss back to zero. */
    private BigDecimal estimatedYearsToRecover;
}
