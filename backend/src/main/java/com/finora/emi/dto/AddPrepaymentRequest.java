package com.finora.emi.dto;

import com.finora.emi.model.PrepaymentImpact;
import com.finora.emi.model.PrepaymentType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddPrepaymentRequest {

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Prepayment amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Prepayment type is required")
    @Builder.Default
    private PrepaymentType prepaymentType = PrepaymentType.ONE_TIME;

    @NotNull(message = "Prepayment impact is required")
    @Builder.Default
    private PrepaymentImpact impact = PrepaymentImpact.REDUCE_TENURE;

    private String notes;
}
