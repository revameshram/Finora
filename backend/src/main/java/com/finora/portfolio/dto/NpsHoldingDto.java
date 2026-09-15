package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NpsHoldingDto {
    private String id;
    private String pensionFundManager;
    private BigDecimal units;
    private BigDecimal avgNav;
    private BigDecimal investedAmount;
    private BigDecimal currentNav;
    private BigDecimal currentValue;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPct;

    private BigDecimal equityPct;
    private BigDecimal corporateDebtPct;
    private BigDecimal governmentSecuritiesPct;
    private BigDecimal alternativePct;

    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
