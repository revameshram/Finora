package com.finora.expense.contract.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finora.common.linking.model.SourceModule;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Transaction linked to a financial goal or FIRE target")
public class GoalLinkedTransactionDto {

    @Schema(description = "Transaction ID", example = "txn_exp_101")
    private String id;

    @Schema(description = "Amount in base INR", example = "25000.00")
    private BigDecimal amount;

    @Schema(description = "Transaction date", example = "2026-08-10")
    private LocalDate date;

    @Schema(description = "Transaction description", example = "Monthly SIP Allocation to Index Fund")
    private String description;

    @Schema(description = "Category", example = "Investments")
    private String category;

    @Schema(description = "Linked Goal UUID", example = "goal_fire_01")
    private String linkedGoalId;

    @Schema(description = "Source module", example = "EXPENSE")
    @Builder.Default
    private SourceModule sourceModule = SourceModule.EXPENSE;

    @JsonProperty("isIncluded")
    @Schema(description = "Whether included in calculation rollups", example = "true")
    @Builder.Default
    private boolean isIncluded = true;
}
