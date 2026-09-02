package com.finora.trip.dto;

import com.finora.trip.model.ChecklistPriority;
import java.time.LocalDate;

public class UpdateChecklistItemRequest {
    private String title;
    private String category;
    private ChecklistPriority priority;
    private LocalDate dueDate;
    private String assignedParticipantId;
    private String description;
    private Boolean done;

    public UpdateChecklistItemRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public ChecklistPriority getPriority() {
        return priority;
    }

    public void setPriority(ChecklistPriority priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getAssignedParticipantId() {
        return assignedParticipantId;
    }

    public void setAssignedParticipantId(String assignedParticipantId) {
        this.assignedParticipantId = assignedParticipantId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getDone() {
        return done;
    }

    public void setDone(Boolean done) {
        this.done = done;
    }
}
