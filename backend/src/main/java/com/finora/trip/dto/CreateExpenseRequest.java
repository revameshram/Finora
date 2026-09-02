package com.finora.trip.dto;

import com.finora.trip.model.SplitType;
import com.finora.trip.model.TripCategory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CreateExpenseRequest {
    private String payerId;
    private String description;
    private TripCategory category = TripCategory.MISCELLANEOUS;
    private BigDecimal amount;
    private String originalCurrency = "INR";
    private BigDecimal originalAmount;
    private LocalDate expenseDate = LocalDate.now();
    private String paymentStatus = "PAID";
    private String notes;

    // Splits
    private List<SplitItemRequest> splits = new ArrayList<>();

    public static class SplitItemRequest {
        private String participantId;
        private SplitType splitType = SplitType.EQUAL;
        private BigDecimal splitValue = BigDecimal.ONE;

        public SplitItemRequest() {
        }

        public SplitItemRequest(String participantId, SplitType splitType, BigDecimal splitValue) {
            this.participantId = participantId;
            this.splitType = splitType;
            this.splitValue = splitValue;
        }

        public String getParticipantId() {
            return participantId;
        }

        public void setParticipantId(String participantId) {
            this.participantId = participantId;
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
    }

    public CreateExpenseRequest() {
    }

    public String getPayerId() {
        return payerId;
    }

    public void setPayerId(String payerId) {
        this.payerId = payerId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TripCategory getCategory() {
        return category;
    }

    public void setCategory(TripCategory category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getOriginalCurrency() {
        return originalCurrency;
    }

    public void setOriginalCurrency(String originalCurrency) {
        this.originalCurrency = originalCurrency;
    }

    public BigDecimal getOriginalAmount() {
        return originalAmount;
    }

    public void setOriginalAmount(BigDecimal originalAmount) {
        this.originalAmount = originalAmount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<SplitItemRequest> getSplits() {
        return splits;
    }

    public void setSplits(List<SplitItemRequest> splits) {
        this.splits = splits;
    }
}
