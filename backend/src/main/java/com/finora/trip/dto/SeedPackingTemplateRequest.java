package com.finora.trip.dto;

import com.finora.trip.model.PackingTemplate;

public class SeedPackingTemplateRequest {
    private PackingTemplate template = PackingTemplate.BASIC_ESSENTIALS;

    public SeedPackingTemplateRequest() {
    }

    public PackingTemplate getTemplate() {
        return template;
    }

    public void setTemplate(PackingTemplate template) {
        this.template = template;
    }
}
