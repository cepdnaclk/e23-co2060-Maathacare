package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.service.PHMProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/phm")
public class PHMProfileController {

    private final PHMProfileService phmProfileService;

    public PHMProfileController(PHMProfileService phmProfileService) {
        this.phmProfileService = phmProfileService;
    }

    @PostMapping("/setup")
    public ResponseEntity<String> setupProfile(@RequestBody PHMProfileRequest request) {
        try {
            PHMProfile profile = phmProfileService.createPHMProfile(request);
            return ResponseEntity.ok("Success! PHM Profile linked for: " + profile.getFullName());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ----------------------------------------------------
    // 🔒 THE NEW SECURE VAULT ENDPOINT
    // ----------------------------------------------------
    @GetMapping("/patients")
    public ResponseEntity<List<String>> getMyPatients() {

        // Dummy data to test that the phone successfully passes the JWT Bouncer
        List<String> dummyPatients = Arrays.asList(
                "1. Kamala Perera - 12 Weeks Pregnant",
                "2. Nimali Silva - 24 Weeks Pregnant",
                "3. Sunethra Fernando - 36 Weeks Pregnant"
        );

        return ResponseEntity.ok(dummyPatients);
    }
}