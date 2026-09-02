package com.finora.emi.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandaloneEmiCalculateRequest {

    @NotNull(message = "Loan amount is required")
    @DecimalMin(value = "1.00", message = "Loan amount must be greater than 0")
    private BigDecimal principalAmount;

    @NotNull(message = "Annual interest rate is required")
    @DecimalMin(value = "0.01", message = "Interest rate must be greater than 0")
    private BigDecimal annualInterestRate;

    @NotNull(message = "Tenure in months is required")
    @Min(value = 1, message = "Tenure must be at least 1 month")
    private Integer tenureMonths;
}
