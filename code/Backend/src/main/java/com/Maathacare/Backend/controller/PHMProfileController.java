package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.service.PHMProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/phm")
public class PHMProfileController {

    private final PHMProfileService phmProfileService;

    public PHMProfileController(PHMProfileService phmProfileService) {
        this.phmProfileService = phmProfileService;
    }

    // Your Part 1 Code
    @PostMapping("/setup")
    public ResponseEntity<String> setupProfile(@RequestBody PHMProfileRequest request) {
        try {
            PHMProfile profile = phmProfileService.createPHMProfile(request);
            return ResponseEntity.ok("Success! PHM Profile linked for: " + profile.getFullName());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // YOUR NEW PART 2 CODE: The GET request to fetch mothers
    @GetMapping("/{phmId}/mothers")
    public ResponseEntity<List<MotherProfile>> getMothersByPhm(@PathVariable UUID phmId) {
        try {
            // Ask the service to find the mothers using the ID from the URL
            List<MotherProfile> mothers = phmProfileService.getMothersForPhm(phmId);
            return ResponseEntity.ok(mothers);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}