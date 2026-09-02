package com.finora.expense.dto;

import com.finora.expense.model.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;

public class ExpenseTaskDto {
    private String id;
    private String profileId;
    private String budgetMonth;
    private String task;
    private TaskStatus status;
    private LocalDate dueDate;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public ExpenseTaskDto() {
    }

    public ExpenseTaskDto(String id, String profileId, String budgetMonth, String task, TaskStatus status, LocalDate dueDate, String notes, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.profileId = profileId;
        this.budgetMonth = budgetMonth;
        this.task = task;
        this.status = status;
        this.dueDate = dueDate;
        this.notes = notes;
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

    public String getTask() {
        return task;
    }

    public void setTask(String task) {
        this.task = task;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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
