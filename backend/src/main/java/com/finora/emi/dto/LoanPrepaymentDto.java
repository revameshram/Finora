package com.finora.emi.dto;

import com.finora.emi.model.PrepaymentImpact;
import com.finora.emi.model.PrepaymentType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanPrepaymentDto {
    private String id;
    private String loanId;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private PrepaymentType prepaymentType;
    private PrepaymentImpact impact;
    private String notes;
    private LocalDateTime createdAt;
}
