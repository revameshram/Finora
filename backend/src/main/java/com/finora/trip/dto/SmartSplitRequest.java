package com.finora.trip.dto;

import com.finora.trip.model.SplitType;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class SmartSplitRequest {
    private BigDecimal totalAmount;
    private SplitType splitType = SplitType.EQUAL;
    private List<ParticipantInput> participants = new ArrayList<>();

    public static class ParticipantInput {
        private String participantId;
        private BigDecimal value; // Ratio/Shares count or Percentage or Exact Amount

        public ParticipantInput() {
        }

        public ParticipantInput(String participantId, BigDecimal value) {
            this.participantId = participantId;
            this.value = value;
        }

        public String getParticipantId() {
            return participantId;
        }

        public void setParticipantId(String participantId) {
            this.participantId = participantId;
        }

        public BigDecimal getValue() {
            return value;
        }

        public void setValue(BigDecimal value) {
            this.value = value;
        }
    }

    public SmartSplitRequest() {
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public SplitType getSplitType() {
        return splitType;
    }

    public void setSplitType(SplitType splitType) {
        this.splitType = splitType;
    }

    public List<ParticipantInput> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ParticipantInput> participants) {
        this.participants = participants;
    }
}
