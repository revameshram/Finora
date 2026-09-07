package com.finora.portfolio.dto;

import com.finora.portfolio.model.DepositStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDepositRequest {
    private String bankName;
    private BigDecimal interestRatePct;
    private LocalDate maturityDate;
    private DepositStatus status;
}
