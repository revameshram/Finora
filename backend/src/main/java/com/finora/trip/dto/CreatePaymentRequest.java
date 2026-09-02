package com.finora.trip.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreatePaymentRequest {
    private String expenseId; // Nullable
    private String fromParticipantId;
    private String toParticipantId;
    private BigDecimal amount;
    private String paymentMethod = "UPI";
    private LocalDate paymentDate = LocalDate.now();
    private String paymentStatus = "COMPLETED";
    private String referenceId;
    private String notes;

    public CreatePaymentRequest() {
    }

    public String getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(String expenseId) {
        this.expenseId = expenseId;
    }

    public String getFromParticipantId() {
        return fromParticipantId;
    }

    public void setFromParticipantId(String fromParticipantId) {
        this.fromParticipantId = fromParticipantId;
    }

    public String getToParticipantId() {
        return toParticipantId;
    }

    public void setToParticipantId(String toParticipantId) {
        this.toParticipantId = toParticipantId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
