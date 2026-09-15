package com.finora.portfolio.dto;

import com.finora.portfolio.model.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRealEstateRequest {

    @NotBlank(message = "Property name is required")
    private String name;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    private String location;

    @NotNull(message = "Purchase price is required")
    private BigDecimal purchasePrice;

    private LocalDate purchaseDate;

    @NotNull(message = "Current estimated value is required")
    private BigDecimal currentEstimatedValue;

    private String notes;
}
