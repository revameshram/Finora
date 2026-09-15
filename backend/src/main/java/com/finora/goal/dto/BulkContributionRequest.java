package com.finora.goal.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkContributionRequest {

    // Modes: "PER_GOAL", "SPLIT_PCT", "SPLIT_FIXED"
    private String mode;
    private BigDecimal totalAmount;
    private LocalDate date;
    private String note;
    
    // For PER_GOAL or SPLIT_FIXED: goalId -> amount
    private Map<String, BigDecimal> goalAllocations;
    
    // For SPLIT_PCT: goalId -> percentage (0 to 100)
    private Map<String, BigDecimal> goalPercentages;
}
