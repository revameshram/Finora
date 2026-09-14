package com.finora.fire.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireGrowthProjectionPointDto {

    private Integer year;
    private Integer age;
    private BigDecimal nominalWealth;
    private BigDecimal realPurchasingPower;
    private BigDecimal targetFireNumber;
    private Boolean isFireReached;
}
