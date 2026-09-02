package com.finora.trip.dto;

import com.finora.trip.model.PackingCategory;
import java.time.Instant;

public class TripPackingItemDto {
    private String id;
    private String tripId;
    private String name;
    private PackingCategory category;
    private boolean packed;
    private Instant createdAt;

    public TripPackingItemDto() {
    }

    public TripPackingItemDto(String id, String tripId, String name, PackingCategory category, boolean packed, Instant createdAt) {
        this.id = id;
        this.tripId = tripId;
        this.name = name;
        this.category = category;
        this.packed = packed;
        this.createdAt = createdAt;
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

    public PackingCategory getCategory() {
        return category;
    }

    public void setCategory(PackingCategory category) {
        this.category = category;
    }

    public boolean isPacked() {
        return packed;
    }

    public void setPacked(boolean packed) {
        this.packed = packed;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
