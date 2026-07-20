package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.MotherProfileRequest;
import com.Maathacare.Backend.dto.MotherProfileResponse;
import com.Maathacare.Backend.model.entity.KickRecord;
import com.Maathacare.Backend.model.entity.MotherProfile; // Correct entity
import com.Maathacare.Backend.model.entity.SymptomRecord;
import com.Maathacare.Backend.repository.SymptomRepository;
import com.Maathacare.Backend.repository.MotherProfileRepository; // Correct repository
import com.Maathacare.Backend.service.MotherProfileService;
import com.Maathacare.Backend.service.StorageService; // Use your existing StorageService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/mothers")
@CrossOrigin(origins = "*")
public class MotherProfileController {

    @Autowired
    private MotherProfileService motherProfileService;

    @Autowired
    private SymptomRepository symptomRepository;

    @Autowired
    private MotherProfileRepository motherProfileRepository; // Use your actual repository

    @Autowired
    private StorageService storageService; // Use the service you already have

    // ... (Keep your existing createProfile, saveKickCount, getKickHistory methods) ...

    @PostMapping("/upload-profile-picture/{userId}")
    public ResponseEntity<?> uploadProfilePicture(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {

        try {
            String authenticatedUserId = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own profile photo.");
            }

            String publicUrl = storageService.uploadAvatar(file, "mothers", userId);

            // 2. Fetch the profile using your Repository
            MotherProfile profile = motherProfileRepository.findByUserUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Profile not found"));

            // 3. Update the URL
            profile.setProfilePictureUrl(publicUrl);
            motherProfileRepository.save(profile);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture updated successfully");
            response.put("profilePictureUrl", publicUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload image: " + e.getMessage());
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        try {
            String authenticatedUserId = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own profile.");
            }
            return ResponseEntity.ok(motherProfileService.getProfileByUserId(userId));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable String userId, @RequestBody MotherProfileRequest request) {
        try {
            String authenticatedUserId = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own profile.");
            }
            return ResponseEntity.ok(motherProfileService.updateMotherProfile(userId, request));
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }
}
