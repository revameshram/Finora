package com.finora.common.currency.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount cannot be negative")
    private BigDecimal amount;

    @NotBlank(message = "From currency is required")
    @Builder.Default
    private String fromCurrency = "INR";

    @NotBlank(message = "To currency is required")
    @Builder.Default
    private String toCurrency = "USD";
}
