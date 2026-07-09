package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.MotherProfileRequest;
import com.Maathacare.Backend.dto.MotherProfileResponse;
import com.Maathacare.Backend.model.entity.KickRecord;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.SymptomRecord;
import com.Maathacare.Backend.repository.SymptomRepository;
import com.Maathacare.Backend.service.MotherProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.Maathacare.Backend.dto.KickCountRequest;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/mothers")
@CrossOrigin(origins = "*")
public class MotherProfileController {

    @Autowired
    private MotherProfileService motherProfileService;

    @Autowired
    private SymptomRepository symptomRepository;

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
            motherProfileService.saveDailyKicks(request);
            return ResponseEntity.ok("Daily kicks recorded successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save kicks: " + e.getMessage());
        }
    }

    @GetMapping("/kicks")
    public ResponseEntity<?> getKickHistory(@RequestParam String userId) {
        try {
            List<KickRecord> history = motherProfileService.getKickHistoryByMotherId(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to retrieve kick history: " + e.getMessage());
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getMotherProfile(@PathVariable String userId) {
        try {
            MotherProfileResponse response = motherProfileService.getProfileByUserId(userId);
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

    // Helper class to catch the JSON data sent from React Native
    public static class SymptomDataRequest {
        private String userId;
        private List<String> symptoms;
        private String date;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public List<String> getSymptoms() { return symptoms; }
        public void setSymptoms(List<String> symptoms) { this.symptoms = symptoms; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }

    @PostMapping("/symptoms")
    public ResponseEntity<?> saveSymptoms(@RequestBody SymptomDataRequest request) {
        try {
            SymptomRecord record = new SymptomRecord();
            record.setUserId(request.getUserId());
            record.setSymptoms(request.getSymptoms());
            record.setTimestamp(LocalDateTime.now());

            // 🌟 REMOVED the LogManager and the null bug here! Uses the real repository now.
            symptomRepository.save(record);

            System.out.println("DEBUG: Saved symptoms for user: " + request.getUserId());
            return ResponseEntity.ok("Symptoms saved successfully!");
        } catch (Exception e) {
            System.out.println("ERROR: Failed to save symptoms: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error saving symptoms: " + e.getMessage());
        }
    }

    @GetMapping("/symptoms")
    public ResponseEntity<?> getSymptomHistory(@RequestParam String userId) {
        try {
            // 🌟 REMOVED the local null bug here too! Uses the connected repository.
            List<SymptomRecord> history = symptomRepository.findByUserIdOrderByTimestampDesc(userId);
            System.out.println("DEBUG: Retrieved " + history.size() + " symptom records for user: " + userId);

            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.out.println("ERROR: Failed to retrieve symptoms: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error fetching history: " + e.getMessage());
        }
    }
}