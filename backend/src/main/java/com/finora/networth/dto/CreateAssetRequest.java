package com.finora.networth.dto;

import com.finora.networth.model.AssetCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
public class CreateAssetRequest {

    @NotBlank(message = "Asset name is required")
    private String name;

    @NotNull(message = "Category is required")
    private AssetCategory category;

    @NotNull(message = "Asset value is required")
    @PositiveOrZero(message = "Value must be positive or zero")
    private BigDecimal value;

    private LocalDate acquiredDate;

    @PositiveOrZero(message = "Growth rate must be positive or zero")
    private BigDecimal growthRatePct;

    @PositiveOrZero(message = "Recurring investment must be positive or zero")
    private BigDecimal recurringInvestment;

    private String notes;
}
