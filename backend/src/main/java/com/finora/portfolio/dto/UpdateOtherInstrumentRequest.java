package com.finora.portfolio.dto;

import jakarta.validation.Valid;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOtherInstrumentRequest {
    private BigDecimal currentValue;
    private String notes;

    @Valid
    private List<CategoryMixEntryDto> categoryMix;
}
