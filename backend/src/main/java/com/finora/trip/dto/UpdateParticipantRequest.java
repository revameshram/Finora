package com.finora.trip.dto;

import com.finora.trip.model.ParticipantCategory;
import java.time.LocalDate;

public class UpdateParticipantRequest {
    private String name;
    private String email;
    private String mobile;
    private LocalDate dob;
    private String preferredLanguage;
    private String foodPreferences;
    private ParticipantCategory category;
    private String parentParticipantId;

    public UpdateParticipantRequest() {
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
}
