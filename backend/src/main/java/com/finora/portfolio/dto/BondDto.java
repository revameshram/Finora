package com.finora.portfolio.dto;

import com.finora.portfolio.model.BondStatus;
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
public class BondDto {
    private String id;
    private String name;
    private String issuer;
    private BigDecimal faceValue;
    private BigDecimal couponRatePct;
    private PaymentFrequency couponFrequency;
    private LocalDate issueDate;
    private LocalDate maturityDate;
    private BigDecimal purchasePrice;
    private BigDecimal currentPrice;
    private BondStatus status;

    private BigDecimal currentValue;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPct;

    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
