package com.finora.networth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finora.common.linking.model.SourceModule;
import com.finora.networth.model.AssetCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDto {

    private String id;
    private String name;
    private AssetCategory category;
    private BigDecimal value;
    private LocalDate acquiredDate;
    private BigDecimal growthRatePct;
    private BigDecimal recurringInvestment;
    private String notes;

    @JsonProperty("isIncluded")
    private boolean isIncluded;

    @JsonProperty("isLinked")
    private boolean isLinked;

    private SourceModule sourceModule;
    private String sourceEntityId;
    private LocalDateTime linkedAt;
    private LocalDateTime createdAt;
}
