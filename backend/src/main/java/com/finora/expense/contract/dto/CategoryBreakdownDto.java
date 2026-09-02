package com.finora.expense.contract.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Category spending breakdown item")
public class CategoryBreakdownDto {

    @Schema(description = "Category name", example = "Housing & Rent")
    private String category;

    @Schema(description = "Total spending in category in base INR", example = "35000.00")
    private BigDecimal amount;

    @Schema(description = "Percentage of total monthly outflow", example = "37.84")
    private BigDecimal percentage;
}
