package com.finora.trip.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tr_expenses")
public class TripExpense {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Column(name = "payer_id", length = 64)
    private String payerId; // Participant who paid

    @Column(nullable = false, length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TripCategory category = TripCategory.MISCELLANEOUS;

    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO; // In base INR

    @Column(name = "original_currency", length = 8)
    private String originalCurrency = "INR";

    @Column(name = "original_amount", precision = 19, scale = 4)
    private BigDecimal originalAmount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate = LocalDate.now();

    @Column(name = "payment_status", length = 32)
    private String paymentStatus = "PAID"; // PAID, PARTIAL, UNPAID, PENDING

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public TripExpense() {
    }

    public TripExpense(String id, String tripId, String payerId, String description, TripCategory category, BigDecimal amount, String originalCurrency, BigDecimal originalAmount, LocalDate expenseDate, String paymentStatus, String notes) {
        this.id = id;
        this.tripId = tripId;
        this.payerId = payerId;
        this.description = description;
        this.category = category != null ? category : TripCategory.MISCELLANEOUS;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.originalCurrency = originalCurrency != null ? originalCurrency : "INR";
        this.originalAmount = originalAmount != null ? originalAmount : this.amount;
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PAID";
        this.notes = notes;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
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
        return amount != null ? amount : BigDecimal.ZERO;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount : BigDecimal.ZERO;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
