package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.service.PHMProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}