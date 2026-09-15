package com.finora.portfolio.dto;

import com.finora.portfolio.model.Market;
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
public class CreateStockHoldingRequest {

    @NotBlank(message = "Ticker is required")
    private String ticker;

    @NotNull(message = "Market is required")
    private Market market;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    /**
     * Ignored (may be null) when useLivePriceAsPurchasePrice is true — universal Finora
     * convention §2.4/§6.6 #1: the service fetches the live price and uses it as the cost instead.
     */
    private BigDecimal costPerUnit;

    @Builder.Default
    private boolean useLivePriceAsPurchasePrice = false;
}
