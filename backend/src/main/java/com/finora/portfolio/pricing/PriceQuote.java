package com.finora.portfolio.pricing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceQuote {
    private BigDecimal price;
    private boolean live;
    private LocalDateTime asOf;
    private String source;
}
