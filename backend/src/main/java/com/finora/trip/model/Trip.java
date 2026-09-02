package com.finora.trip.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tr_trips")
public class Trip {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 255)
    private String destination;

    @Column(name = "departure_location", length = 255)
    private String departureLocation;

    @Column(name = "adults_count", nullable = false)
    private int adultsCount = 1;

    @Column(name = "kids_count", nullable = false)
    private int kidsCount = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "hotel_preference", length = 128)
    private String hotelPreference;

    @Column(name = "additional_details", columnDefinition = "TEXT")
    private String additionalDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TripStatus status = TripStatus.UPCOMING;

    @Column(name = "total_budget", precision = 19, scale = 4)
    private BigDecimal totalBudget = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Trip() {
    }

    public Trip(String id, String userId, String name, String destination, String departureLocation, int adultsCount, int kidsCount, LocalDate startDate, LocalDate endDate, String hotelPreference, String additionalDetails, BigDecimal totalBudget) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.destination = destination;
        this.departureLocation = departureLocation;
        this.adultsCount = adultsCount;
        this.kidsCount = kidsCount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.hotelPreference = hotelPreference;
        this.additionalDetails = additionalDetails;
        this.status = TripStatus.UPCOMING;
        this.totalBudget = totalBudget != null ? totalBudget : BigDecimal.ZERO;
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
        return totalBudget != null ? totalBudget : BigDecimal.ZERO;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget != null ? totalBudget : BigDecimal.ZERO;
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
