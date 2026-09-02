package com.finora.trip.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class TripExpensePaymentDto {
    private String id;
    private String tripId;
    private String expenseId;
    private String fromParticipantId;
    private String fromParticipantName;
    private String toParticipantId;
    private String toParticipantName;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDate paymentDate;
    private String paymentStatus;
    private String referenceId;
    private String notes;
    private Instant createdAt;

    public TripExpensePaymentDto() {
    }

    public TripExpensePaymentDto(String id, String tripId, String expenseId, String fromParticipantId, String fromParticipantName, String toParticipantId, String toParticipantName, BigDecimal amount, String paymentMethod, LocalDate paymentDate, String paymentStatus, String referenceId, String notes, Instant createdAt) {
        this.id = id;
        this.tripId = tripId;
        this.expenseId = expenseId;
        this.fromParticipantId = fromParticipantId;
        this.fromParticipantName = fromParticipantName;
        this.toParticipantId = toParticipantId;
        this.toParticipantName = toParticipantName;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.paymentDate = paymentDate;
        this.paymentStatus = paymentStatus;
        this.referenceId = referenceId;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTripId() {
        return tripId;
    }

    public void setTripId(String tripId) {
        this.tripId = tripId;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
