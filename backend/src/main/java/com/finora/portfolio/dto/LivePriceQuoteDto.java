package com.finora.portfolio.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response for the live-price preview endpoint — lets an add-holding form show the current live
 * price before submit (§2.4/§6.6 #2, mirroring the currency module's /convert preview shape).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivePriceQuoteDto {
    private BigDecimal price;
    private boolean isLive;
    private LocalDateTime asOf;
    private String source;
}
