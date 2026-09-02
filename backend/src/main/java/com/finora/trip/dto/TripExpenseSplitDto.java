package com.finora.trip.dto;

import com.finora.trip.model.SplitType;
import java.math.BigDecimal;

public class TripExpenseSplitDto {
    private String id;
    private String participantId;
    private String participantName;
    private SplitType splitType;
    private BigDecimal splitValue;
    private BigDecimal computedAmount;

    public TripExpenseSplitDto() {
    }

    public TripExpenseSplitDto(String id, String participantId, String participantName, SplitType splitType, BigDecimal splitValue, BigDecimal computedAmount) {
        this.id = id;
        this.participantId = participantId;
        this.participantName = participantName;
        this.splitType = splitType;
        this.splitValue = splitValue;
        this.computedAmount = computedAmount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getParticipantId() {
        return participantId;
    }

    public void setParticipantId(String participantId) {
        this.participantId = participantId;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public SplitType getSplitType() {
        return splitType;
    }

    public void setSplitType(SplitType splitType) {
        this.splitType = splitType;
    }

    public BigDecimal getSplitValue() {
        return splitValue;
    }

    public void setSplitValue(BigDecimal splitValue) {
        this.splitValue = splitValue;
    }

    public BigDecimal getComputedAmount() {
        return computedAmount;
    }

    public void setComputedAmount(BigDecimal computedAmount) {
        this.computedAmount = computedAmount;
    }
}
