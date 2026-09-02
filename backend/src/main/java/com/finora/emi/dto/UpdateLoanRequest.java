package com.finora.emi.dto;

import com.finora.emi.model.LoanStatus;
import com.finora.emi.model.LoanType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateLoanRequest {
    private String loanName;
    private LoanType loanType;
    private String lenderName;
    private String accountNumberMasked;
    private BigDecimal sanctionedAmount;
    private BigDecimal annualInterestRate;
    private Integer tenureMonths;
    private LocalDate startDate;
    private BigDecimal monthlyEmi;
    private LoanStatus status;
    private Boolean syncWithNetWorth;
    private String notes;
}
