package com.finora.expense.model;

import com.finora.common.linking.model.LinkableEntity;
import com.finora.common.linking.model.SourceModule;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "et_transactions")
public class ExpenseTransaction extends LinkableEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "profile_id", length = 64, nullable = false)
    private String profileId;

    @Column(name = "budget_month", length = 7, nullable = false) // Format: "YYYY-MM"
    private String budgetMonth;

    @Column(name = "item", nullable = false)
    private String item;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 32, nullable = false)
    private ExpenseCategory category;

    @Column(name = "amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16, nullable = false)
    private TransactionStatus status; // PENDING vs DONE

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "payment_method")
    private String paymentMethod; // e.g. "Credit Card", "UPI", "Net Banking", "Cash"

    @Column(name = "linked_goal_id", length = 64)
    private String linkedGoalId; // For Goal Manager reporting tags

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ExpenseTransaction() {
        super();
        this.status = TransactionStatus.DONE;
        this.category = ExpenseCategory.OTHER;
    }

    public ExpenseTransaction(String id, String profileId, String budgetMonth, String item, String description,
                              ExpenseCategory category, BigDecimal amount, TransactionStatus status,
                              LocalDate paymentDate, String paymentMethod, String linkedGoalId) {
        super();
        this.id = id;
        this.profileId = profileId;
        this.budgetMonth = budgetMonth;
        this.item = item;
        this.description = description;
        this.category = category;
        this.amount = amount;
        this.status = status != null ? status : TransactionStatus.DONE;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.linkedGoalId = linkedGoalId;
        this.setIncluded(true);
        this.setLinked(false);
        this.setSourceModule(SourceModule.MANUAL);
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
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
