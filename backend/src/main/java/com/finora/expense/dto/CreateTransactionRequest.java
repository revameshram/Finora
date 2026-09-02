package com.finora.expense.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finora.common.linking.model.SourceModule;
import com.finora.expense.model.ExpenseCategory;
import com.finora.expense.model.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateTransactionRequest {
    private String budgetMonth; // "YYYY-MM"
    private String item;
    private String description;
    private ExpenseCategory category;
    private BigDecimal amount;
    private TransactionStatus status; // PENDING vs DONE
    private LocalDate paymentDate;
    private String paymentMethod;
    private String linkedGoalId;

    @JsonProperty("isIncluded")
    private Boolean isIncluded;

    @JsonProperty("isLinked")
    private Boolean isLinked;

    private SourceModule sourceModule;
    private String sourceEntityId;

    public CreateTransactionRequest() {
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

    public Boolean getIncluded() {
        return isIncluded;
    }

    public void setIncluded(Boolean included) {
        isIncluded = included;
    }

    public Boolean getLinked() {
        return isLinked;
    }

    public void setLinked(Boolean linked) {
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
}
