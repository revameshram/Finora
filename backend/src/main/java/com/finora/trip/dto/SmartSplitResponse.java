package com.finora.trip.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class SmartSplitResponse {
    private BigDecimal totalAmount;
    private BigDecimal computedSum;
    private BigDecimal roundingRemainder;
    private List<ParticipantSplitItem> splits = new ArrayList<>();

    public static class ParticipantSplitItem {
        private String participantId;
        private BigDecimal shareValue;
        private BigDecimal calculatedAmount;
        private BigDecimal effectivePercentage;

        public ParticipantSplitItem() {
        }

        public ParticipantSplitItem(String participantId, BigDecimal shareValue, BigDecimal calculatedAmount, BigDecimal effectivePercentage) {
            this.participantId = participantId;
            this.shareValue = shareValue;
            this.calculatedAmount = calculatedAmount;
            this.effectivePercentage = effectivePercentage;
        }

        public String getParticipantId() {
            return participantId;
        }

        public void setParticipantId(String participantId) {
            this.participantId = participantId;
        }

        public BigDecimal getShareValue() {
            return shareValue;
        }

        public void setShareValue(BigDecimal shareValue) {
            this.shareValue = shareValue;
        }

        public BigDecimal getCalculatedAmount() {
            return calculatedAmount;
        }

        public void setCalculatedAmount(BigDecimal calculatedAmount) {
            this.calculatedAmount = calculatedAmount;
        }

        public BigDecimal getEffectivePercentage() {
            return effectivePercentage;
        }

        public void setEffectivePercentage(BigDecimal effectivePercentage) {
            this.effectivePercentage = effectivePercentage;
        }
    }

    public SmartSplitResponse() {
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getComputedSum() {
        return computedSum;
    }

    public void setComputedSum(BigDecimal computedSum) {
        this.computedSum = computedSum;
    }

    public BigDecimal getRoundingRemainder() {
        return roundingRemainder;
    }

    public void setRoundingRemainder(BigDecimal roundingRemainder) {
        this.roundingRemainder = roundingRemainder;
    }

    public List<ParticipantSplitItem> getSplits() {
        return splits;
    }

    public void setSplits(List<ParticipantSplitItem> splits) {
        this.splits = splits;
    }
}
