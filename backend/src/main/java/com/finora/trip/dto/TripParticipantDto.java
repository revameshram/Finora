package com.finora.trip.dto;

import com.finora.trip.model.ParticipantCategory;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TripParticipantDto {
    private String id;
    private String tripId;
    private String name;
    private String email;
    private String mobile;
    private LocalDate dob;
    private String preferredLanguage;
    private String foodPreferences;
    private ParticipantCategory category;
    private String parentParticipantId;
    private String parentName;
    private List<TripParticipantDto> dependents = new ArrayList<>();
    private Instant createdAt;

    public TripParticipantDto() {
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

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public List<TripParticipantDto> getDependents() {
        return dependents;
    }

    public void setDependents(List<TripParticipantDto> dependents) {
        this.dependents = dependents;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
