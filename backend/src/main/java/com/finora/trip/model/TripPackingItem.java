package com.finora.trip.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tr_packing_items")
public class TripPackingItem {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PackingCategory category = PackingCategory.ESSENTIALS;

    @Column(nullable = false)
    private boolean packed = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public TripPackingItem() {
    }

    public TripPackingItem(String id, String tripId, String name, PackingCategory category, boolean packed) {
        this.id = id;
        this.tripId = tripId;
        this.name = name;
        this.category = category != null ? category : PackingCategory.ESSENTIALS;
        this.packed = packed;
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
