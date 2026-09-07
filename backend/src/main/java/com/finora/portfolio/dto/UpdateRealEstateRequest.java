package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRealEstateRequest {
    private String location;
    private BigDecimal currentEstimatedValue;
    private String notes;
}
