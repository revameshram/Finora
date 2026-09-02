package com.finora.emi.dto;

import com.finora.emi.model.PrepaymentImpact;
import com.finora.emi.model.PrepaymentType;
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
public class PrepaymentSimulationRequest {

    private String loanId;

    @NotNull(message = "Prepayment amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Prepayment type is required")
    @Builder.Default
    private PrepaymentType prepaymentType = PrepaymentType.ONE_TIME;

    @NotNull(message = "Impact is required")
    @Builder.Default
    private PrepaymentImpact impact = PrepaymentImpact.REDUCE_TENURE;

    private LocalDate simulationDate;
    private Integer startMonthIndex;
}
