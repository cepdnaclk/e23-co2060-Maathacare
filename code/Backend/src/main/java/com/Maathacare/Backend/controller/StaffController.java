package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.StaffRegistrationRequest;
import com.Maathacare.Backend.dto.StaffResponse;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.entity.MotherProfile; // Added Import
import com.Maathacare.Backend.repository.MotherProfileRepository; // Added Import
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.Maathacare.Backend.dto.AreaStat;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/users/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PHMProfileRepository phmProfileRepository;

    @Autowired
    private MotherProfileRepository motherProfileRepository; // Added Repository

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/all")
    public ResponseEntity<List<StaffResponse>> getAllStaff() {
        List<PHMProfile> profiles = phmProfileRepository.findAll();
        List<StaffResponse> responseList = profiles.stream().map(profile -> {
            StaffResponse dto = new StaffResponse();
            dto.setFullName(profile.getFullName());
            dto.setMohArea(profile.getMohArea());
            dto.setNic(profile.getUser().getUserId());
            dto.setStaffId(profile.getUser().getStaffId());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerStaff(@RequestBody StaffRegistrationRequest request) {
        try {
            if (userRepository.findByUserId(request.getNic()).isPresent() ||
                    userRepository.findByStaffId(request.getStaffId()).isPresent()) {
                return ResponseEntity.badRequest().body("Error: Staff ID or NIC is already in use.");
            }

            User newUser = new User();
            newUser.setUserId(request.getNic());
            newUser.setStaffId(request.getStaffId());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setRole(Role.PHM);
            userRepository.save(newUser);

            PHMProfile phmProfile = new PHMProfile();
            phmProfile.setUser(newUser);
            phmProfile.setFullName(request.getFullName());
            phmProfile.setMohArea(request.getMohArea());
            phmProfile.setRegistrationNumber(request.getStaffId());
            phmProfileRepository.save(phmProfile);

            return ResponseEntity.ok("Staff registered successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Registration failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{staffId}")
    public ResponseEntity<?> deleteStaff(@PathVariable String staffId) {
        try {
            User user = userRepository.findByStaffId(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff ID not found"));

            PHMProfile phmProfile = phmProfileRepository.findByUserStaffId(staffId)
                    .orElseThrow(() -> new RuntimeException("Profile not found"));

            // Fix for Foreign Key constraint: set link to null before deleting
            List<MotherProfile> assignedMothers = motherProfileRepository.findByPhmProfile_Id(phmProfile.getId());
            for (MotherProfile mother : assignedMothers) {
                mother.setPhmProfile(null);
                motherProfileRepository.save(mother);
            }

            phmProfileRepository.delete(phmProfile);
            userRepository.delete(user);

            return ResponseEntity.ok("Staff removed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/toggle-status/{staffId}")
    public ResponseEntity<?> toggleStaffStatus(@PathVariable String staffId) {
        try {
            User user = userRepository.findByStaffId(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff ID not found"));
            boolean currentStatus = user.getActive() != null ? user.getActive() : true;
            user.setActive(!currentStatus);
            userRepository.save(user);
            return ResponseEntity.ok("Status toggled.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/reset-password/{staffId}")
    public ResponseEntity<?> resetStaffPassword(@PathVariable String staffId) {
        try {
            User user = userRepository.findByStaffId(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff ID not found"));
            user.setPasswordHash(passwordEncoder.encode(user.getUserId()));
            userRepository.save(user);
            return ResponseEntity.ok("Password reset.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats/distribution")
    public ResponseEntity<List<AreaStat>> getStaffDistribution() {
        // Target: Max 150 mothers per 1 PHM (You can adjust this later)
        final double TARGET_MAX_CASELOAD = 150.0;

        List<PHMProfile> phmProfiles = phmProfileRepository.findAll();
        List<MotherProfile> motherProfiles = motherProfileRepository.findAll();

        // Group PHMs by Area
        Map<String, Long> phmDistribution = phmProfiles.stream()
                .collect(Collectors.groupingBy(PHMProfile::getMohArea, Collectors.counting()));

        // Group Mothers by their assigned PHM's Area
        Map<String, Long> motherDistribution = motherProfiles.stream()
                .filter(m -> m.getPhmProfile() != null)
                .collect(Collectors.groupingBy(m -> m.getPhmProfile().getMohArea(), Collectors.counting()));

        // Calculate the Real-World Ratio
        List<AreaStat> finalStats = phmDistribution.entrySet().stream().map(entry -> {
            String areaName = entry.getKey();
            long phmCount = entry.getValue();
            long motherCount = motherDistribution.getOrDefault(areaName, 0L);

            // Calculate how many mothers each PHM is handling on average in this area
            double caseloadRatio = (phmCount > 0) ? (double) motherCount / phmCount : 0;

            // If the ratio exceeds our safe target, they are Overloaded
            String status = caseloadRatio <= TARGET_MAX_CASELOAD ? "Adequate" : "Overloaded";

            return new AreaStat(areaName, phmCount, motherCount, status);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(finalStats);
    }
}