package com.finora.trip.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tr_expense_payments")
public class TripExpensePayment {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Column(name = "expense_id", length = 64)
    private String expenseId; // Optional; null if general settle-up payment

    @Column(name = "from_participant_id", nullable = false, length = 64)
    private String fromParticipantId;

    @Column(name = "to_participant_id", nullable = false, length = 64)
    private String toParticipantId;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "payment_method", length = 64)
    private String paymentMethod = "UPI"; // UPI, Cash, Card, Bank Transfer

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate = LocalDate.now();

    @Column(name = "payment_status", length = 32)
    private String paymentStatus = "COMPLETED";

    @Column(name = "reference_id", length = 64)
    private String referenceId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public TripExpensePayment() {
    }

    public TripExpensePayment(String id, String tripId, String expenseId, String fromParticipantId, String toParticipantId, BigDecimal amount, String paymentMethod, LocalDate paymentDate, String paymentStatus, String referenceId, String notes) {
        this.id = id;
        this.tripId = tripId;
        this.expenseId = expenseId;
        this.fromParticipantId = fromParticipantId;
        this.toParticipantId = toParticipantId;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "UPI";
        this.paymentDate = paymentDate != null ? paymentDate : LocalDate.now();
        this.paymentStatus = paymentStatus != null ? paymentStatus : "COMPLETED";
        this.referenceId = referenceId;
        this.notes = notes;
        this.createdAt = Instant.now();
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

    public String getToParticipantId() {
        return toParticipantId;
    }

    public void setToParticipantId(String toParticipantId) {
        this.toParticipantId = toParticipantId;
    }

    public BigDecimal getAmount() {
        return amount != null ? amount : BigDecimal.ZERO;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount : BigDecimal.ZERO;
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
