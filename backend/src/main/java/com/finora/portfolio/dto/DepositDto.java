package com.finora.portfolio.dto;

import com.finora.portfolio.model.DepositStatus;
import com.finora.portfolio.model.DepositType;
import com.finora.portfolio.model.PaymentFrequency;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositDto {
    private String id;
    private DepositType depositType;
    private String bankName;
    private BigDecimal principalAmount;
    private BigDecimal interestRatePct;
    private LocalDate startDate;
    private LocalDate maturityDate;
    private PaymentFrequency compoundingFrequency;
    private DepositStatus status;

    // Computed as-of-today accrued value (compound interest formula) — not stored.
    private BigDecimal currentValue;
    private BigDecimal maturityValue;

    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
