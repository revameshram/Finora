package com.finora.emi.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmortizationMonthDto {
    private Integer monthIndex;
    private Integer installmentNumber;
    private LocalDate paymentDate;
    private BigDecimal openingBalance;
    private BigDecimal emiAmount;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private BigDecimal prepaymentAmount;
    private BigDecimal totalMonthlyPaid;
    private BigDecimal closingBalance;
    private Boolean isPaid;
    private String linkedExpenseTransactionId;
}
