package com.finora.emi.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmiExpenseMatchDto {
    private String transactionId;
    private String description;
    private BigDecimal amount;
    private LocalDate transactionDate;
    private String paymentMethod;
    private Boolean isMatched;
    private Integer matchedInstallmentNumber;
}
