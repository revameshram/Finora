package com.finora.networth.contract.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finora.common.linking.model.SourceModule;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload sent by EMI Manager to push a new loan into Net Worth Tracker")
public class CreateLiabilityRequest {

    @NotBlank(message = "Name is required")
    @Schema(description = "Name of the liability", example = "SBI Personal Loan")
    private String name;

    @NotBlank(message = "Category is required")
    @Schema(description = "Category", example = "PERSONAL_LOAN")
    private String category;

    @NotNull(message = "Balance is required")
    @Positive(message = "Balance must be positive")
    @Schema(description = "Current balance in base INR", example = "200000.00")
    private BigDecimal balance;

    @NotNull(message = "Original amount is required")
    @Positive(message = "Original amount must be positive")
    @Schema(description = "Original loan amount in base INR", example = "200000.00")
    private BigDecimal originalAmount;

    @NotNull(message = "Interest rate is required")
    @Schema(description = "Annual interest percentage", example = "11.50")
    private BigDecimal interestRate;

    @NotNull(message = "Source module is required")
    @Schema(description = "Source module", example = "EMI_MANAGER")
    @Builder.Default
    private SourceModule sourceModule = SourceModule.EMI_MANAGER;

    @NotBlank(message = "Source entity ID is required")
    @Schema(description = "ID of the loan in EMI Manager", example = "emi_loan_202")
    private String sourceEntityId;

    @JsonProperty("isIncluded")
    @Schema(description = "Included in Net Worth total", example = "true")
    @Builder.Default
    private boolean isIncluded = true;

    @JsonProperty("isLinked")
    @Schema(description = "Whether the liability is linked to source", example = "true")
    @Builder.Default
    private boolean isLinked = true;
}
