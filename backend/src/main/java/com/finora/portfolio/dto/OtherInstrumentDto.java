package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtherInstrumentDto {
    private String id;
    private String name;
    private String category;
    private BigDecimal investedAmount;
    private BigDecimal currentValue;
    private String notes;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPct;
    private List<CategoryMixEntryDto> categoryMix;
    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
