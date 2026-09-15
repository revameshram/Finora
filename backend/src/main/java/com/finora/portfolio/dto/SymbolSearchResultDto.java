package com.finora.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Result row for GET /api/v1/portfolio/search — search-as-you-type (3+ chars) on the Add
 * Stock/ETF modal (§6.5). Backed by a small curated in-memory symbol list, not a live exchange
 * directory — a real symbol-search API is a stretch item, not something free/reliable today.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymbolSearchResultDto {
    private String ticker;
    private String companyName;
    private String market; // NSE / US
}
