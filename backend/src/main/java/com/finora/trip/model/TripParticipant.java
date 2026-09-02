package com.finora.trip.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tr_participants")
public class TripParticipant {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(length = 128)
    private String email;

    @Column(length = 32)
    private String mobile;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "preferred_language", length = 64)
    private String preferredLanguage;

    @Column(name = "food_preferences", length = 128)
    private String foodPreferences;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ParticipantCategory category = ParticipantCategory.TOURIST;

    @Column(name = "parent_participant_id", length = 64)
    private String parentParticipantId; // Nullable; references parent participant for family nesting

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public TripParticipant() {
    }

    public TripParticipant(String id, String tripId, String name, String email, String mobile, LocalDate dob, String preferredLanguage, String foodPreferences, ParticipantCategory category, String parentParticipantId) {
        this.id = id;
        this.tripId = tripId;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.dob = dob;
        this.preferredLanguage = preferredLanguage;
        this.foodPreferences = foodPreferences;
        this.category = category != null ? category : ParticipantCategory.TOURIST;
        this.parentParticipantId = parentParticipantId;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getFoodPreferences() {
        return foodPreferences;
    }

    public void setFoodPreferences(String foodPreferences) {
        this.foodPreferences = foodPreferences;
    }

    public ParticipantCategory getCategory() {
        return category;
    }

    public void setCategory(ParticipantCategory category) {
        this.category = category;
    }

    public String getParentParticipantId() {
        return parentParticipantId;
    }

    public void setParentParticipantId(String parentParticipantId) {
        this.parentParticipantId = parentParticipantId;
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
