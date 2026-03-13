package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.repository.MotherProfileRepository; // 🟢 ADD THIS
import com.Maathacare.Backend.service.PHMProfileService;
import org.springframework.beans.factory.annotation.Autowired; // 🟢 ADD THIS
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phm")
public class PHMProfileController {

    private final PHMProfileService phmProfileService;

    public PHMProfileController(PHMProfileService phmProfileService) {
        this.phmProfileService = phmProfileService;
    }

    /**
     * Endpoint for initial test setup of PHM profiles.
     */
    @PostMapping("/setup")
    public ResponseEntity<String> setupProfile(@RequestBody PHMProfileRequest request) {
        try {
            PHMProfile profile = phmProfileService.createPHMProfile(request);
            return ResponseEntity.ok("Success! PHM Profile linked for: " + profile.getFullName());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 🔒 SECURE ENDPOINT: Fetches the real list of mothers assigned to the logged-in PHM.
     * Replaces the dummy string list with actual MotherProfile entities.
     */
    @GetMapping("/patients")
    public ResponseEntity<List<MotherProfile>> getMyPatients() {
        // 🟢 Calling the real service logic
        List<MotherProfile> patients = phmProfileService.getMyPatients();
        return ResponseEntity.ok(patients);
    }

    /**
     * 🔒 SECURE ENDPOINT: Fetches the personal profile details of the logged-in PHM.
     */
    @GetMapping("/me")
    public ResponseEntity<PHMProfile> getCurrentPHMProfile() {
        // 🟢 Matching the method name in your Service (getMyProfile)
        PHMProfile profile = phmProfileService.getMyProfile();
        return ResponseEntity.ok(profile);
    }
    // Inside PHMProfileController.java
    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @PutMapping("/assign-mother/{nic}")
    public ResponseEntity<?> assignMotherToMe(@PathVariable String nic) {
        try {
            // 1. Identify the logged-in PHM
            PHMProfile phm = phmProfileService.getMyProfile(); // This uses your existing logic

            // 2. Find the Mother by NIC
            MotherProfile mother = motherProfileRepository.findByNic(nic)
                    .orElseThrow(() -> new RuntimeException("No registered mother found with NIC: " + nic));

            // 3. Link the PHM to the Mother
            mother.setPhmProfile(phm);
            motherProfileRepository.save(mother);

            return ResponseEntity.ok("Assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}