package com.finora.emi.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmortizationYearDto {
    private Integer yearIndex;
    private Integer calendarYear;
    private BigDecimal openingBalance;
    private BigDecimal totalEmiPaid;
    private BigDecimal totalPrincipalPaid;
    private BigDecimal totalInterestPaid;
    private BigDecimal totalPrepaymentPaid;
    private BigDecimal closingBalance;
    private List<AmortizationMonthDto> months;
}
