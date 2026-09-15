package com.finora.portfolio.dto;

import com.finora.portfolio.model.Capitalisation;
import com.finora.portfolio.model.MfCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMutualFundHoldingRequest {

    @NotBlank(message = "Scheme code is required")
    private String schemeCode;

    @NotBlank(message = "Scheme name is required")
    private String schemeName;

    @NotNull(message = "Category is required")
    private MfCategory category;

    private Capitalisation capitalisation;

    @NotNull(message = "Units is required")
    @DecimalMin(value = "0.0001", message = "Units must be greater than 0")
    private BigDecimal units;

    private BigDecimal navPerUnit;

    @Builder.Default
    private boolean useLivePriceAsPurchasePrice = false;
}
