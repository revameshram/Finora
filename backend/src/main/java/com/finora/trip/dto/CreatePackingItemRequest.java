package com.finora.trip.dto;

import com.finora.trip.model.PackingCategory;
import com.finora.trip.model.PackingTemplate;

public class CreatePackingItemRequest {
    private String name;
    private PackingCategory category = PackingCategory.ESSENTIALS;

    public CreatePackingItemRequest() {
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
}
