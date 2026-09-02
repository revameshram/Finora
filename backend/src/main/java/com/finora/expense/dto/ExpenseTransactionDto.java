package com.finora.expense.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finora.common.linking.model.SourceModule;
import com.finora.expense.model.ExpenseCategory;
import com.finora.expense.model.TransactionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class ExpenseTransactionDto {
    private String id;
    private String profileId;
    private String budgetMonth;
    private String item;
    private String description;
    private ExpenseCategory category;
    private BigDecimal amount;
    private TransactionStatus status;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String linkedGoalId;

    @JsonProperty("isIncluded")
    private boolean isIncluded;

    @JsonProperty("isLinked")
    private boolean isLinked;

    private SourceModule sourceModule;
    private String sourceEntityId;
    private Instant createdAt;
    private Instant updatedAt;

    public ExpenseTransactionDto() {
    }

    public ExpenseTransactionDto(String id, String profileId, String budgetMonth, String item, String description,
                                 ExpenseCategory category, BigDecimal amount, TransactionStatus status,
                                 LocalDate paymentDate, String paymentMethod, String linkedGoalId,
                                 boolean isIncluded, boolean isLinked, SourceModule sourceModule,
                                 String sourceEntityId, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.profileId = profileId;
        this.budgetMonth = budgetMonth;
        this.item = item;
        this.description = description;
        this.category = category;
        this.amount = amount;
        this.status = status;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.linkedGoalId = linkedGoalId;
        this.isIncluded = isIncluded;
        this.isLinked = isLinked;
        this.sourceModule = sourceModule;
        this.sourceEntityId = sourceEntityId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProfileId() {
        return profileId;
    }

    public void setProfileId(String profileId) {
        this.profileId = profileId;
    }

    public String getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(String budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getLinkedGoalId() {
        return linkedGoalId;
    }

    public void setLinkedGoalId(String linkedGoalId) {
        this.linkedGoalId = linkedGoalId;
    }

    public boolean isIncluded() {
        return isIncluded;
    }

    public void setIncluded(boolean included) {
        isIncluded = included;
    }

    public boolean isLinked() {
        return isLinked;
    }

    public void setLinked(boolean linked) {
        isLinked = linked;
    }

    public SourceModule getSourceModule() {
        return sourceModule;
    }

    public void setSourceModule(SourceModule sourceModule) {
        this.sourceModule = sourceModule;
    }

    public String getSourceEntityId() {
        return sourceEntityId;
    }

    public void setSourceEntityId(String sourceEntityId) {
        this.sourceEntityId = sourceEntityId;
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
