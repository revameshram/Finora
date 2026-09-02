package com.finora.common.linking.dto;

import com.finora.common.linking.model.Linkable;
import com.finora.common.linking.model.SourceModule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkableDto {

    @Builder.Default
    private boolean isIncluded = true;

    @Builder.Default
    private boolean isLinked = false;

    @Builder.Default
    private SourceModule sourceModule = SourceModule.MANUAL;

    private String sourceEntityId;
    private LocalDateTime linkedAt;

    public static LinkableDto fromLinkable(Linkable linkable) {
        if (linkable == null) {
            return LinkableDto.builder().build();
        }
        return LinkableDto.builder()
                .isIncluded(linkable.isIncluded())
                .isLinked(linkable.isLinked())
                .sourceModule(linkable.getSourceModule())
                .sourceEntityId(linkable.getSourceEntityId())
                .linkedAt(linkable.getLinkedAt())
                .build();
    }
}
