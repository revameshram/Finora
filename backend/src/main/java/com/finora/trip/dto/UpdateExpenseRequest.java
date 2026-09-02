package com.finora.trip.dto;

import com.finora.trip.model.TripCategory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class UpdateExpenseRequest {
    private String payerId;
    private String description;
    private TripCategory category;
    private BigDecimal amount;
    private String originalCurrency;
    private BigDecimal originalAmount;
    private LocalDate expenseDate;
    private String paymentStatus;
    private String notes;
    private List<CreateExpenseRequest.SplitItemRequest> splits;

    public UpdateExpenseRequest() {
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

    public List<CreateExpenseRequest.SplitItemRequest> getSplits() {
        return splits;
    }

    public void setSplits(List<CreateExpenseRequest.SplitItemRequest> splits) {
        this.splits = splits;
    }
}
