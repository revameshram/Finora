package com.finora.portfolio.dto;

import com.finora.portfolio.model.PropertyType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealEstateDto {
    private String id;
    private String name;
    private PropertyType propertyType;
    private String location;
    private BigDecimal purchasePrice;
    private LocalDate purchaseDate;
    private BigDecimal currentEstimatedValue;
    private String notes;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPct;
    private Boolean isIncluded;
    private LocalDateTime createdAt;
}
