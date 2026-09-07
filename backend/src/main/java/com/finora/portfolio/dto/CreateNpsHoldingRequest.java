package com.finora.portfolio.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNpsHoldingRequest {

    private String pensionFundManager;

    @NotNull(message = "Units is required")
    @DecimalMin(value = "0.0001", message = "Units must be greater than 0")
    private BigDecimal units;

    @NotNull(message = "Average NAV is required")
    private BigDecimal avgNav;

    private BigDecimal currentNav;

    // NPS Scheme Allocation split — must sum to 100.0 if provided.
    private BigDecimal equityPct;
    private BigDecimal corporateDebtPct;
    private BigDecimal governmentSecuritiesPct;
    private BigDecimal alternativePct;
}
