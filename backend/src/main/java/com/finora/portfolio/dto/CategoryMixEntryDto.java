package com.finora.portfolio.dto;

import com.finora.portfolio.model.CategoryMixBucket;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryMixEntryDto {
    @NotNull(message = "Bucket is required")
    private CategoryMixBucket bucket;

    @NotNull(message = "Percentage is required")
    private BigDecimal percentage;
}
