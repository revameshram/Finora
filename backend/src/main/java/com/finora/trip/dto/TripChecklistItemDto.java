package com.finora.trip.dto;

import com.finora.trip.model.ChecklistPriority;
import java.time.Instant;
import java.time.LocalDate;

public class TripChecklistItemDto {
    private String id;
    private String tripId;
    private String title;
    private String category;
    private ChecklistPriority priority;
    private LocalDate dueDate;
    private String assignedParticipantId;
    private String assignedParticipantName;
    private String description;
    private boolean done;
    private Instant createdAt;

    public TripChecklistItemDto() {
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

    public String getAssignedParticipantName() {
        return assignedParticipantName;
    }

    public void setAssignedParticipantName(String assignedParticipantName) {
        this.assignedParticipantName = assignedParticipantName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
