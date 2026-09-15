package com.finora.portfolio.dto;

import com.finora.portfolio.model.PaymentFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBondRequest {

    @NotBlank(message = "Bond name is required")
    private String name;

    private String issuer;

    @NotNull(message = "Face value is required")
    @DecimalMin(value = "1.00", message = "Face value must be greater than 0")
    private BigDecimal faceValue;

    @NotNull(message = "Coupon rate is required")
    private BigDecimal couponRatePct;

    @Builder.Default
    private PaymentFrequency couponFrequency = PaymentFrequency.ANNUALLY;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Maturity date is required")
    private LocalDate maturityDate;

    @NotNull(message = "Purchase price is required")
    private BigDecimal purchasePrice;

    private BigDecimal currentPrice;
}
