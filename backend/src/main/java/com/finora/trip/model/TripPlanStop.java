package com.finora.trip.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tr_plan_stops")
public class TripPlanStop {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Column(name = "stop_date", nullable = false)
    private LocalDate stopDate;

    @Column(name = "stop_time", length = 16)
    private String stopTime; // e.g. "06:00", "14:00"

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PlanStopCategory category = PlanStopCategory.ACTIVITY;

    @Column(length = 255)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "estimated_cost", precision = 19, scale = 4)
    private BigDecimal estimatedCost = BigDecimal.ZERO;

    @Column(name = "assigned_participant_ids", columnDefinition = "TEXT")
    private String assignedParticipantIds; // Comma-delimited or JSON string

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public TripPlanStop() {
    }

    public TripPlanStop(String id, String tripId, LocalDate stopDate, String stopTime, String title, PlanStopCategory category, String location, String description, BigDecimal estimatedCost, String assignedParticipantIds, String notes) {
        this.id = id;
        this.tripId = tripId;
        this.stopDate = stopDate;
        this.stopTime = stopTime;
        this.title = title;
        this.category = category != null ? category : PlanStopCategory.ACTIVITY;
        this.location = location;
        this.description = description;
        this.estimatedCost = estimatedCost != null ? estimatedCost : BigDecimal.ZERO;
        this.assignedParticipantIds = assignedParticipantIds;
        this.notes = notes;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
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

    public LocalDate getStopDate() {
        return stopDate;
    }

    public void setStopDate(LocalDate stopDate) {
        this.stopDate = stopDate;
    }

    public String getStopTime() {
        return stopTime;
    }

    public void setStopTime(String stopTime) {
        this.stopTime = stopTime;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public PlanStopCategory getCategory() {
        return category;
    }

    public void setCategory(PlanStopCategory category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getEstimatedCost() {
        return estimatedCost != null ? estimatedCost : BigDecimal.ZERO;
    }

    public void setEstimatedCost(BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost != null ? estimatedCost : BigDecimal.ZERO;
    }

    public String getAssignedParticipantIds() {
        return assignedParticipantIds;
    }

    public void setAssignedParticipantIds(String assignedParticipantIds) {
        this.assignedParticipantIds = assignedParticipantIds;
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
