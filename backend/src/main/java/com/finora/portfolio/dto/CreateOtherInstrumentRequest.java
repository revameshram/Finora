package com.finora.portfolio.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOtherInstrumentRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String category;

    @NotNull(message = "Invested amount is required")
    private BigDecimal investedAmount;

    @NotNull(message = "Current value is required")
    private BigDecimal currentValue;

    private String notes;

    /**
     * The Category Mix percentage splitter (§6.5) — service validates this sums to 100.0%.
     * The "Use 100% as Others" shortcut is a UI-only convenience; the server just accepts the
     * resulting single-bucket split it produces.
     */
    @NotEmpty(message = "Category mix is required")
    @Valid
    private List<CategoryMixEntryDto> categoryMix;
}
