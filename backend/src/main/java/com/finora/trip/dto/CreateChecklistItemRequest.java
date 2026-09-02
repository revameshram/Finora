package com.finora.trip.dto;

import com.finora.trip.model.ChecklistPriority;
import java.time.LocalDate;

public class CreateChecklistItemRequest {
    private String title;
    private String category = "General";
    private ChecklistPriority priority = ChecklistPriority.MEDIUM;
    private LocalDate dueDate;
    private String assignedParticipantId;
    private String description;

    public CreateChecklistItemRequest() {
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
}
