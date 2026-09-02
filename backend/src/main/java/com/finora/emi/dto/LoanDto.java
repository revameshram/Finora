package com.finora.emi.dto;

import com.finora.emi.model.LoanStatus;
import com.finora.emi.model.LoanType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanDto {
    private String id;
    private String userId;
    private String loanName;
    private LoanType loanType;
    private String lenderName;
    private String accountNumberMasked;
    private BigDecimal sanctionedAmount;
    private BigDecimal currentOutstanding;
    private BigDecimal annualInterestRate;
    private Integer tenureMonths;
    private LocalDate startDate;
    private LocalDate projectedEndDate;
    private BigDecimal monthlyEmi;
    private LoanStatus status;
    private String linkedNetWorthLiabilityId;
    private String notes;

    // Rollup statistics
    private BigDecimal totalPrincipalPaid;
    private BigDecimal totalInterestPaid;
    private BigDecimal totalPrepaymentPaid;
    private BigDecimal totalPaymentPayable;
    private BigDecimal totalInterestPayable;
    private Double progressPercent;
    private Integer remainingTenureMonths;
    private Boolean isLinked;
    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
