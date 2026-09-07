package com.finora.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One row of the computed Bond schedule modal (§6.5, extending the FD pattern per §6.6 #4):
 * Date, Coupon, Capital, Payout, Status.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BondScheduleEntryDto {
    private LocalDate date;
    private BigDecimal coupon;
    private BigDecimal capital;
    private BigDecimal payout;
    private String status; // Paid / Realized / Upcoming
}
