package com.finora.trip.dto;

import com.finora.trip.model.TripStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class TripDto {
    private String id;
    private String userId;
    private String name;
    private String destination;
    private String departureLocation;
    private int adultsCount;
    private int kidsCount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String hotelPreference;
    private String additionalDetails;
    private TripStatus status;
    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private int participantsCount;
    private int stopsCount;
    private int checklistOpenCount;
    private int checklistTotalCount;
    private int packingPackedCount;
    private int packingTotalCount;
    private Instant createdAt;
    private Instant updatedAt;

    public TripDto() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getDepartureLocation() {
        return departureLocation;
    }

    public void setDepartureLocation(String departureLocation) {
        this.departureLocation = departureLocation;
    }

    public int getAdultsCount() {
        return adultsCount;
    }

    public void setAdultsCount(int adultsCount) {
        this.adultsCount = adultsCount;
    }

    public int getKidsCount() {
        return kidsCount;
    }

    public void setKidsCount(int kidsCount) {
        this.kidsCount = kidsCount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getHotelPreference() {
        return hotelPreference;
    }

    public void setHotelPreference(String hotelPreference) {
        this.hotelPreference = hotelPreference;
    }

    public String getAdditionalDetails() {
        return additionalDetails;
    }

    public void setAdditionalDetails(String additionalDetails) {
        this.additionalDetails = additionalDetails;
    }

    public TripStatus getStatus() {
        return status;
    }

    public void setStatus(TripStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public int getParticipantsCount() {
        return participantsCount;
    }

    public void setParticipantsCount(int participantsCount) {
        this.participantsCount = participantsCount;
    }

    public int getStopsCount() {
        return stopsCount;
    }

    public void setStopsCount(int stopsCount) {
        this.stopsCount = stopsCount;
    }

    public int getChecklistOpenCount() {
        return checklistOpenCount;
    }

    public void setChecklistOpenCount(int checklistOpenCount) {
        this.checklistOpenCount = checklistOpenCount;
    }

    public int getChecklistTotalCount() {
        return checklistTotalCount;
    }

    public void setChecklistTotalCount(int checklistTotalCount) {
        this.checklistTotalCount = checklistTotalCount;
    }

    public int getPackingPackedCount() {
        return packingPackedCount;
    }

    public void setPackingPackedCount(int packingPackedCount) {
        this.packingPackedCount = packingPackedCount;
    }

    public int getPackingTotalCount() {
        return packingTotalCount;
    }

    public void setPackingTotalCount(int packingTotalCount) {
        this.packingTotalCount = packingTotalCount;
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
