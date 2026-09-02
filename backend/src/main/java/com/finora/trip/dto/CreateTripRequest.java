package com.finora.trip.dto;

import com.finora.trip.model.TripStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateTripRequest {
    private String name;
    private String destination;
    private String departureLocation;
    private int adultsCount = 1;
    private int kidsCount = 0;
    private LocalDate startDate;
    private LocalDate endDate;
    private String hotelPreference;
    private String additionalDetails;
    private BigDecimal totalBudget;

    public CreateTripRequest() {
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

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }
}
