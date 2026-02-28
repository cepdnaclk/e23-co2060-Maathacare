package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.MotherProfileRequest;
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
            // Hand the form to the Service Brain we just built
            MotherProfile newProfile = motherProfileService.createMotherProfile(request);

            // If it works, send a 200 OK Success message back to the phone!
            return ResponseEntity.ok("Success! Mother Profile created with ID: " + newProfile.getId());
        } catch (RuntimeException e) {
            // If the Service throws an error (like NIC already exists), send a 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/{userId}")
    public ResponseEntity<?> getMotherProfile(@PathVariable String userId) {
        try {
            // Ask the Service Brain to fetch the profile
            MotherProfile profile = motherProfileService.getProfileByUserId(userId);

            // Send the profile data back to the phone/screen!
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            // If not found, send a 400 Bad Request error
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}