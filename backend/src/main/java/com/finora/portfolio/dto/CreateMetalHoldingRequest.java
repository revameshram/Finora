package com.finora.portfolio.dto;

import com.finora.portfolio.model.MetalType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMetalHoldingRequest {

    @NotNull(message = "Metal type is required")
    private MetalType metalType;

    private Integer purityKarat;

    @NotNull(message = "Quantity in grams is required")
    @DecimalMin(value = "0.0001", message = "Quantity must be greater than 0")
    private BigDecimal quantityGrams;

    private BigDecimal costPerGram;

    @Builder.Default
    private boolean useLivePriceAsPurchasePrice = false;
}
