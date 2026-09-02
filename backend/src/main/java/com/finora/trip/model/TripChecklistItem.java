package com.finora.trip.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tr_checklist_items")
public class TripChecklistItem {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 64)
    private String category = "General";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ChecklistPriority priority = ChecklistPriority.MEDIUM;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "assigned_participant_id", length = 64)
    private String assignedParticipantId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean done = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public TripChecklistItem() {
    }

    public TripChecklistItem(String id, String tripId, String title, String category, ChecklistPriority priority, LocalDate dueDate, String assignedParticipantId, String description, boolean done) {
        this.id = id;
        this.tripId = tripId;
        this.title = title;
        this.category = category != null ? category : "General";
        this.priority = priority != null ? priority : ChecklistPriority.MEDIUM;
        this.dueDate = dueDate;
        this.assignedParticipantId = assignedParticipantId;
        this.description = description;
        this.done = done;
        this.createdAt = Instant.now();
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
