package com.finora.portfolio.dto;

import com.finora.portfolio.model.DepositType;
import com.finora.portfolio.model.PaymentFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDepositRequest {

    @NotNull(message = "Deposit type is required")
    private DepositType depositType;

    private String bankName;

    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "1.00", message = "Principal must be greater than 0")
    private BigDecimal principalAmount;

    @NotNull(message = "Interest rate is required")
    private BigDecimal interestRatePct;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Maturity date is required")
    private LocalDate maturityDate;

    @Builder.Default
    private PaymentFrequency compoundingFrequency = PaymentFrequency.QUARTERLY;
}
