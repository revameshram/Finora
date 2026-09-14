package com.finora.networth.dto;

import com.finora.networth.model.AssetCategory;
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
public class UpdateAssetRequest {

    private String name;
    private AssetCategory category;
    private BigDecimal value;
    private LocalDate acquiredDate;
    private BigDecimal growthRatePct;
    private BigDecimal recurringInvestment;
    private String notes;
    private Boolean isIncluded;
}
