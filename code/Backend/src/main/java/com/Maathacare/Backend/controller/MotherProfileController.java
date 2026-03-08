package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.MotherProfileRequest;
import com.Maathacare.Backend.dto.MotherProfileResponse;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.service.MotherProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mothers")
public class MotherProfileController {

    private final MotherProfileService motherProfileService;

    public MotherProfileController(MotherProfileService motherProfileService) {
        this.motherProfileService = motherProfileService;
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createProfile(@RequestBody MotherProfileRequest request) {
        try {
            MotherProfile newProfile = motherProfileService.createMotherProfile(request);
            return ResponseEntity.ok("Success! Mother Profile created with ID: " + newProfile.getId());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getMotherProfile(@PathVariable String userId) {
        try {
            // 🟢 WE CHANGED THIS LINE: It now correctly catches the 'MotherProfileResponse'
            // directly from the service, matching the new upgraded logic!
            MotherProfileResponse response = motherProfileService.getProfileByUserId(userId);

            // And sends it straight back to React Native
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Profile not found: " + e.getMessage());
        }
    }
}