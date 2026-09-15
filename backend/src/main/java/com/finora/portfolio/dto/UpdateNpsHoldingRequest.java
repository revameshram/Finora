package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateNpsHoldingRequest {
    private String pensionFundManager;
    private BigDecimal units;
    private BigDecimal avgNav;
    private BigDecimal currentNav;
    private BigDecimal equityPct;
    private BigDecimal corporateDebtPct;
    private BigDecimal governmentSecuritiesPct;
    private BigDecimal alternativePct;
}
