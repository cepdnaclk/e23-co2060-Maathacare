package com.Maathacare.Backend.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Maathacare.Backend.dto.AuthRequest;
import com.Maathacare.Backend.dto.AuthResponse;
import com.Maathacare.Backend.dto.UserRegistrationRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import com.Maathacare.Backend.security.JwtService;
import com.Maathacare.Backend.service.UserService;
import com.Maathacare.Backend.dto.PasswordChangeRequest;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @Autowired
    private PHMProfileRepository phmProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    // ----------------------------------------------------
    // 🤱 MOTHER ENDPOINTS
    // ----------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest request) {
        try {
            if (userRepository.findById(request.getPhoneNumber()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Phone number already registered.");
            }

            User newUser = new User();
            newUser.setUserId(request.getPhoneNumber().trim());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setRole(Role.MOTHER);
            newUser.setActive(true);

            User savedUser = userRepository.save(newUser);

            MotherProfile profile = new MotherProfile();
            profile.setUser(savedUser);
            profile.setFullName(request.getFullName());
            profile.setNic(request.getNic());
            profile.setDateOfBirth(request.getDateOfBirth());
            profile.setAddress(request.getAddress());
            profile.setEmergencyContactNumber(request.getEmergencyContactNumber());
            profile.setBloodGroup(request.getBloodGroup());
            profile.setLastMenstrualPeriod(request.getLastMenstrualPeriod());
            profile.setDistrict(request.getDistrict());
            profile.setProvince(request.getProvince());
            profile.setResidentialDivision(request.getResidentialDivision());

            // 🟢 NEW: Save the GN Division to the Mother's Profile
            profile.setGnDivision(request.getGnDivision());

            // 🟢 NEW: Assign PHM based on GN Division instead of MOH Area
            if (request.getGnDivision() != null && !request.getGnDivision().trim().isEmpty()) {
                Optional<PHMProfile> assignedPhm = phmProfileRepository.findByGnDivision(request.getGnDivision().trim());

                if (assignedPhm.isPresent()) {
                    profile.setPhmProfile(assignedPhm.get()); // Link the PHM if found
                }
            }

            motherProfileRepository.save(profile);
            return ResponseEntity.status(HttpStatus.CREATED).body("Mother Account and Profile created!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // ----------------------------------------------------
    // UPDATED: MOTHER LOGIN ENDPOINT
    // ----------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> requestData) {
        try {
            String phone = requestData.get("phoneNumber").trim();
            String password = requestData.get("password");
            return ResponseEntity.ok(userService.loginUser(phone, password));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ----------------------------------------------------
    // 👩‍⚕️ STAFF LOGIN ENDPOINT
    // ----------------------------------------------------
    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(@RequestBody AuthRequest request) {
        if (request == null
                || request.getStaffId() == null
                || request.getStaffId().trim().isEmpty()
                || request.getPassword() == null
                || request.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Staff ID and password are required.");
        }

        String staffId = request.getStaffId().trim();
        User user = userRepository.findByStaffId(staffId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Staff ID not found.");
        }

        if (user.getRole() == Role.MOTHER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }

        if (Boolean.FALSE.equals(user.getActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("This staff account is inactive.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }

        return ResponseEntity.ok(
                new AuthResponse(jwtService.generateToken(user), user.getRole().name())
        );
    }


    // ----------------------------------------------------
    // ⚙️ SETUP & TESTING ENDPOINTS
    // ----------------------------------------------------
    @GetMapping("/admin/setup")
    public ResponseEntity<String> setupMasterAdmin() {
        if (userRepository.findByStaffId("ADMIN-MASTER").isPresent()) {
            return ResponseEntity.ok("Master Admin already exists!");
        }

        User admin = new User();
        admin.setUserId("ADMIN-MASTER");
        admin.setStaffId("ADMIN-MASTER");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        return ResponseEntity.ok("Master Admin Created! ID: ADMIN-MASTER | Password: admin123");
    }

    @GetMapping("/staff/create-test")
    public ResponseEntity<String> createTestStaff() {
        if (userRepository.findByStaffId("PHM-100").isPresent()) {
            return ResponseEntity.ok("Test Midwife already exists!");
        }

        User testStaff = new User();
        testStaff.setUserId("999999999V");
        testStaff.setStaffId("PHM-100");
        testStaff.setPasswordHash(passwordEncoder.encode("password123"));
        testStaff.setRole(Role.PHM);
        testStaff.setActive(true);
        User savedUser = userRepository.save(testStaff);

        PHMProfile profile = new PHMProfile();
        profile.setUser(savedUser);
        profile.setFullName("Test Midwife");
        profile.setRegistrationNumber("PHM-100");
        profile.setMohArea("Colombo MC");

        // 🟢 NEW: Assign the test PHM to a specific GN Division for testing
        profile.setGnDivision("Borella North");

        phmProfileRepository.save(profile);

        return ResponseEntity.ok("Test Midwife and Profile Created! Assigned to GN Division: Borella North");
    }

    // ----------------------------------------------------
    // 📱 PUSH NOTIFICATION ENDPOINTS
    // ----------------------------------------------------
    @PutMapping("/{userId}/push-token")
    public ResponseEntity<?> updatePushToken(@PathVariable String userId, @RequestParam String token) {
        try {
            userService.updatePushToken(userId, token);
            return ResponseEntity.ok("Push token updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error saving push token: " + e.getMessage());
        }
    }

}