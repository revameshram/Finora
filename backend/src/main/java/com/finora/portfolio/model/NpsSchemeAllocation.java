package com.finora.portfolio.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * One row per NPS holding: the Equity/Corporate Debt/Government Securities/Alternative % split
 * that drives the dashboard's NPS Scheme Allocation panel (§6.2) and the equity-bucket fraction
 * used by the Equity Drawdown Check (§6.4).
 */
@Entity
@Table(name = "pt_nps_scheme_allocation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NpsSchemeAllocation {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "nps_holding_id", nullable = false, length = 64, unique = true)
    private String npsHoldingId;

    @Column(name = "equity_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal equityPct = BigDecimal.ZERO;

    @Column(name = "corporate_debt_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal corporateDebtPct = BigDecimal.ZERO;

    @Column(name = "government_securities_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal governmentSecuritiesPct = BigDecimal.ZERO;

    @Column(name = "alternative_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal alternativePct = BigDecimal.ZERO;
}
