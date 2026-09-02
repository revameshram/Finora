package com.finora.networth.contract.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finora.common.linking.model.SourceModule;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Liability item in Net Worth Tracker consumed by EMI Manager")
public class NetWorthLiabilityDto {

    @Schema(description = "Liability UUID", example = "lia_nw_01")
    private String id;

    @Schema(description = "Name of loan or liability", example = "HDFC Home Loan")
    private String name;

    @Schema(description = "Category", example = "HOME_LOAN")
    private String category;

    @Schema(description = "Outstanding balance in base INR", example = "4250000.00")
    private BigDecimal balance;

    @Schema(description = "Original sanctioned amount in base INR", example = "5000000.00")
    private BigDecimal originalAmount;

    @Schema(description = "Annual interest rate percentage", example = "8.50")
    private BigDecimal interestRate;

    @JsonProperty("isIncluded")
    @Schema(description = "Included in Net Worth calculation rollups", example = "true")
    @Builder.Default
    private boolean isIncluded = true;

    @JsonProperty("isLinked")
    @Schema(description = "Whether linked to an upstream module", example = "true")
    @Builder.Default
    private boolean isLinked = false;

    @Schema(description = "Source module", example = "EMI_MANAGER")
    @Builder.Default
    private SourceModule sourceModule = SourceModule.MANUAL;

    @Schema(description = "ID in source module table", example = "emi_loan_101")
    private String sourceEntityId;

    @Schema(description = "Timestamp when link was established")
    private LocalDateTime linkedAt;
}
