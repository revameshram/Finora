package com.finora.emi.dto;

import com.finora.emi.model.LoanType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLoanRequest {

    @NotBlank(message = "Loan name is required")
    private String loanName;

    @NotNull(message = "Loan type is required")
    private LoanType loanType;

    private String lenderName;
    private String accountNumberMasked;

    @NotNull(message = "Sanctioned amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be greater than 0")
    private BigDecimal sanctionedAmount;

    @NotNull(message = "Annual interest rate is required")
    @DecimalMin(value = "0.01", message = "Interest rate must be greater than 0")
    private BigDecimal annualInterestRate;

    @NotNull(message = "Tenure in months is required")
    @Min(value = 1, message = "Tenure must be at least 1 month")
    private Integer tenureMonths;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private BigDecimal customMonthlyEmi;
    private Boolean syncWithNetWorth;
    private String notes;
}
