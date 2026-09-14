package com.finora.fire.controller;

import com.finora.common.auth.UserPrincipal;
import com.finora.fire.dto.FireSummaryDto;
import com.finora.fire.dto.UpdateFirePlanRequest;
import com.finora.fire.service.FirePlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fire")
@RequiredArgsConstructor
public class FirePlannerController {

    private final FirePlannerService firePlannerService;

    @GetMapping("/plan")
    public ResponseEntity<FireSummaryDto> getFireSummary(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(firePlannerService.getFireSummary(userId));
    }

    @PutMapping("/plan")
    public ResponseEntity<FireSummaryDto> updateFirePlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateFirePlanRequest request) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(firePlannerService.updateFirePlan(request, userId));
    }

    @PostMapping("/calculate")
    public ResponseEntity<FireSummaryDto> calculateSandbox(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateFirePlanRequest request) {
        String userId = principal != null ? principal.getId() : "demo-user";
        return ResponseEntity.ok(firePlannerService.calculateSandbox(request, userId));
    }

    @PostMapping("/seed")
    public ResponseEntity<Void> seedSampleData(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "demo-user";
        firePlannerService.seedSampleData(userId);
        return ResponseEntity.ok().build();
    }
}
