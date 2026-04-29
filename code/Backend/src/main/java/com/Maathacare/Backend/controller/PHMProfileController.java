package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import com.Maathacare.Backend.service.PHMProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phm")
@CrossOrigin(origins = "*")
public class PHMProfileController {

    private final PHMProfileService phmProfileService;

    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @Autowired
    private PHMProfileRepository phmProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    @GetMapping("/patients")
    public ResponseEntity<List<MotherProfile>> getMyPatients() {
        List<MotherProfile> patients = phmProfileService.getMyPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/me")
    public ResponseEntity<PHMProfile> getCurrentPHMProfile() {
        PHMProfile profile = phmProfileService.getMyProfile();
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/assign-mother/{nic}")
    public ResponseEntity<?> assignMotherToMe(@PathVariable String nic) {
        try {
            PHMProfile phm = phmProfileService.getMyProfile();
            MotherProfile mother = motherProfileRepository.findByNic(nic)
                    .orElseThrow(() -> new RuntimeException("No registered mother found with NIC: " + nic));

            mother.setPhmProfile(phm);
            motherProfileRepository.save(mother);
            return ResponseEntity.ok("Assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            PHMProfile phm = phmProfileService.getMyProfile();

            // 🟢 FIXED: Using getPasswordHash() to match the User entity[cite: 2, 3]
            if (!passwordEncoder.matches(oldPassword, phm.getUser().getPasswordHash())) {
                return ResponseEntity.badRequest().body("Current password is incorrect.");
            }

            // 🟢 FIXED: Using setPasswordHash() to match the User entity[cite: 2, 3]
            phm.getUser().setPasswordHash(passwordEncoder.encode(newPassword));
            phmProfileRepository.save(phm);

            return ResponseEntity.ok("Password updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating password: " + e.getMessage());
        }
    }
}