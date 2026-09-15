package com.finora.networth.dto;

import com.finora.networth.model.LiabilityCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLiabilityRequest {

    private String name;
    private LiabilityCategory category;
    private BigDecimal amount;
    private LocalDate incurredDate;
    private BigDecimal interestRatePct;
    private BigDecimal recurringPayment;
    private String notes;
    private Boolean isIncluded;
}
