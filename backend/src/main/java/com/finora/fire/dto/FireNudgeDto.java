package com.finora.fire.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireNudgeDto {

    private String id;
    private String type; // "EXCELLENT_SAVINGS", "HIGH_EXPENSE_DRAG", "INCREASE_SWR", "AGE_UNSET"
    private String severity; // "CRITICAL", "WARNING", "INFO", "SUCCESS"
    private String title;
    private String message;
    private String actionLabel;
}
