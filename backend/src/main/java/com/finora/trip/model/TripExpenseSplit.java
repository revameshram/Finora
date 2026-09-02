package com.finora.trip.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tr_expense_splits")
public class TripExpenseSplit {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "expense_id", nullable = false, length = 64)
    private String expenseId;

    @Column(name = "participant_id", nullable = false, length = 64)
    private String participantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "split_type", nullable = false, length = 32)
    private SplitType splitType = SplitType.EQUAL;

    @Column(name = "split_value", precision = 19, scale = 4)
    private BigDecimal splitValue = BigDecimal.ONE; // Ratio, percentage, or exact amount

    @Column(name = "computed_amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal computedAmount = BigDecimal.ZERO; // In base INR

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public TripExpenseSplit() {
    }

    public TripExpenseSplit(String id, String expenseId, String participantId, SplitType splitType, BigDecimal splitValue, BigDecimal computedAmount) {
        this.id = id;
        this.expenseId = expenseId;
        this.participantId = participantId;
        this.splitType = splitType != null ? splitType : SplitType.EQUAL;
        this.splitValue = splitValue != null ? splitValue : BigDecimal.ONE;
        this.computedAmount = computedAmount != null ? computedAmount : BigDecimal.ZERO;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(String expenseId) {
        this.expenseId = expenseId;
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

    public BigDecimal getComputedAmount() {
        return computedAmount;
    }

    public void setComputedAmount(BigDecimal computedAmount) {
        this.computedAmount = computedAmount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
