package com.finora.insights.dto;

import com.finora.common.linking.model.SourceModule;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Actionable cross-module strategic recommendation or nudge")
public class RecommendationNudgeDto {

    @Schema(description = "Unique nudge identifier", example = "rec_prepay_arbitrage")
    private String id;

    @Schema(description = "Urgency severity: CRITICAL, WARNING, OPPORTUNITY, POSITIVE", example = "OPPORTUNITY")
    private String severity;

    @Schema(description = "Headline title", example = "Prepayment vs Investment Arbitrage")
    private String title;

    @Schema(description = "Detailed rationale and strategic advice", example = "Your ICICI Auto Loan rate is 9.20%. Allocating ₹15,000 from monthly cash flow to prepayments saves ₹48,000 in interest.")
    private String message;

    @Schema(description = "Source module originating this recommendation", example = "EMI_MANAGER")
    private SourceModule sourceModule;

    @Schema(description = "Button label for direct action", example = "Simulate Prepayment")
    private String actionLabel;

    @Schema(description = "Navigation route for action shortcut", example = "emi-manager")
    private String actionRoute;
}
