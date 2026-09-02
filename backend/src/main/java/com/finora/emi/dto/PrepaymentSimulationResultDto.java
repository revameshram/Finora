package com.finora.emi.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrepaymentSimulationResultDto {
    private BigDecimal baselineTotalInterest;
    private BigDecimal baselineTotalPayment;
    private Integer baselineTenureMonths;
    private LocalDate baselinePayoffDate;

    // After prepayment
    private BigDecimal simulatedTotalInterest;
    private BigDecimal simulatedTotalPayment;
    private Integer simulatedTenureMonths;
    private LocalDate simulatedPayoffDate;
    private BigDecimal simulatedNewMonthlyEmi;

    // Savings & Benefits
    private BigDecimal totalInterestSaved;
    private Integer monthsSaved;
    private Double interestSavingsPercent;
    private BigDecimal totalPrepaymentInvested;
}
