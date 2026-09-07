package com.finora.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One row of the computed FD/RD schedule modal (§6.5): Date, Deposit, Earned Interest, Capital, Status.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepositScheduleEntryDto {
    private LocalDate date;
    private BigDecimal deposit;
    private BigDecimal earnedInterest;
    private BigDecimal capital;
    private String status; // Paid / Realized / Upcoming
}
