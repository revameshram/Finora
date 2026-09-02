package com.finora.trip.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class SettleMatrixDto {
    private BigDecimal totalTripExpenses = BigDecimal.ZERO;
    private BigDecimal totalPaymentsMade = BigDecimal.ZERO;
    private BigDecimal totalUnsettledBalance = BigDecimal.ZERO;
    private List<ParticipantBalanceDto> participantBalances = new ArrayList<>();
    private List<SuggestedTransferDto> suggestedTransfers = new ArrayList<>();

    public static class ParticipantBalanceDto {
        private String participantId;
        private String participantName;
        private BigDecimal totalPaid = BigDecimal.ZERO;
        private BigDecimal totalShare = BigDecimal.ZERO;
        private BigDecimal netBalance = BigDecimal.ZERO; // Paid - Share
        private String status; // "OWED" (positive), "OWES" (negative), "SETTLED" (zero)

        public ParticipantBalanceDto() {
        }

        public ParticipantBalanceDto(String participantId, String participantName, BigDecimal totalPaid, BigDecimal totalShare, BigDecimal netBalance, String status) {
            this.participantId = participantId;
            this.participantName = participantName;
            this.totalPaid = totalPaid != null ? totalPaid : BigDecimal.ZERO;
            this.totalShare = totalShare != null ? totalShare : BigDecimal.ZERO;
            this.netBalance = netBalance != null ? netBalance : BigDecimal.ZERO;
            this.status = status;
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

        public BigDecimal getTotalPaid() {
            return totalPaid;
        }

        public void setTotalPaid(BigDecimal totalPaid) {
            this.totalPaid = totalPaid;
        }

        public BigDecimal getTotalShare() {
            return totalShare;
        }

        public void setTotalShare(BigDecimal totalShare) {
            this.totalShare = totalShare;
        }

        public BigDecimal getNetBalance() {
            return netBalance;
        }

        public void setNetBalance(BigDecimal netBalance) {
            this.netBalance = netBalance;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class SuggestedTransferDto {
        private String fromParticipantId;
        private String fromParticipantName;
        private String toParticipantId;
        private String toParticipantName;
        private BigDecimal amount;

        public SuggestedTransferDto() {
        }

        public SuggestedTransferDto(String fromParticipantId, String fromParticipantName, String toParticipantId, String toParticipantName, BigDecimal amount) {
            this.fromParticipantId = fromParticipantId;
            this.fromParticipantName = fromParticipantName;
            this.toParticipantId = toParticipantId;
            this.toParticipantName = toParticipantName;
            this.amount = amount;
        }

        public String getFromParticipantId() {
            return fromParticipantId;
        }

        public void setFromParticipantId(String fromParticipantId) {
            this.fromParticipantId = fromParticipantId;
        }

        public String getFromParticipantName() {
            return fromParticipantName;
        }

        public void setFromParticipantName(String fromParticipantName) {
            this.fromParticipantName = fromParticipantName;
        }

        public String getToParticipantId() {
            return toParticipantId;
        }

        public void setToParticipantId(String toParticipantId) {
            this.toParticipantId = toParticipantId;
        }

        public String getToParticipantName() {
            return toParticipantName;
        }

        public void setToParticipantName(String toParticipantName) {
            this.toParticipantName = toParticipantName;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
    }

    public SettleMatrixDto() {
    }

    public BigDecimal getTotalTripExpenses() {
        return totalTripExpenses;
    }

    public void setTotalTripExpenses(BigDecimal totalTripExpenses) {
        this.totalTripExpenses = totalTripExpenses;
    }

    public BigDecimal getTotalPaymentsMade() {
        return totalPaymentsMade;
    }

    public void setTotalPaymentsMade(BigDecimal totalPaymentsMade) {
        this.totalPaymentsMade = totalPaymentsMade;
    }

    public BigDecimal getTotalUnsettledBalance() {
        return totalUnsettledBalance;
    }

    public void setTotalUnsettledBalance(BigDecimal totalUnsettledBalance) {
        this.totalUnsettledBalance = totalUnsettledBalance;
    }

    public List<ParticipantBalanceDto> getParticipantBalances() {
        return participantBalances;
    }

    public void setParticipantBalances(List<ParticipantBalanceDto> participantBalances) {
        this.participantBalances = participantBalances;
    }

    public List<SuggestedTransferDto> getSuggestedTransfers() {
        return suggestedTransfers;
    }

    public void setSuggestedTransfers(List<SuggestedTransferDto> suggestedTransfers) {
        this.suggestedTransfers = suggestedTransfers;
    }
}
