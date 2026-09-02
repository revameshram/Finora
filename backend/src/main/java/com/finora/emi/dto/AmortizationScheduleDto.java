package com.finora.emi.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmortizationScheduleDto {
    private String loanId;
    private BigDecimal sanctionedAmount;
    private BigDecimal currentOutstanding;
    private BigDecimal monthlyEmi;
    private BigDecimal annualInterestRate;
    private Integer originalTenureMonths;
    private Integer actualTenureMonths;
    private Integer monthsSaved;
    private LocalDate startDate;
    private LocalDate projectedPayoffDate;
    private BigDecimal totalPrincipalPaid;
    private BigDecimal totalInterestPaid;
    private BigDecimal totalPrepaymentPaid;
    private BigDecimal totalAmountPayable;
    private BigDecimal totalInterestSaved;
    private List<AmortizationYearDto> yearlySchedules;
    private List<AmortizationMonthDto> monthlySchedules;
}
