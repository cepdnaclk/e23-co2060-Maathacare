package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.MotherProfileRequest;
import com.Maathacare.Backend.dto.MotherProfileResponse;
import com.Maathacare.Backend.model.entity.KickRecord;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.service.MotherProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.Maathacare.Backend.dto.KickCountRequest;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mothers")
@CrossOrigin(origins = "*")
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

    @PostMapping("/kicks")
    public ResponseEntity<?> saveKickCount(@RequestBody KickCountRequest request) {
        try {
            // This links the kicks to the user (e.g., Sayuri) in your PostgreSQL DB
            motherProfileService.saveDailyKicks(request);
            return ResponseEntity.ok("Daily kicks recorded successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save kicks: " + e.getMessage());
        }
    }

    @GetMapping("/kicks")
    public ResponseEntity<?> getKickHistory(@RequestParam String userId) {
        try {
            // Pass userId directly as a String now
            List<KickRecord> history = motherProfileService.getKickHistoryByMotherId(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to retrieve kick history: " + e.getMessage());
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

    @GetMapping("/phm/{userId}/patients")
    public ResponseEntity<?> getPhmPatients(@PathVariable String userId) {
        try {
            List<MotherProfileResponse> patients = motherProfileService.getPatientsForPhm(userId);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- NEW PUSH TOKEN UPDATE ENDPOINT ADDED HERE ---
    @PutMapping("/{userId}/push-token")
    public ResponseEntity<?> updatePushToken(@PathVariable String userId, @RequestBody Map<String, String> payload) {
        try {
            String pushToken = payload.get("pushToken");
            if (pushToken == null || pushToken.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Push token cannot be empty");
            }

            motherProfileService.updatePushTokenByUserId(userId, pushToken);
            return ResponseEntity.ok("Push token updated successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Failed to update push token: " + e.getMessage());
        }
    }
}