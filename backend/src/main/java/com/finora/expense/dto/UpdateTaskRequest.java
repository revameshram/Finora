package com.finora.expense.dto;

import com.finora.expense.model.TaskStatus;
import java.time.LocalDate;

public class UpdateTaskRequest {
    private String task;
    private TaskStatus status;
    private LocalDate dueDate;
    private String notes;

    public UpdateTaskRequest() {
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
}
