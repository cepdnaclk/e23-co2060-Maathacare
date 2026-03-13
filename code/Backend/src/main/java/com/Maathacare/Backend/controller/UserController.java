package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.AuthRequest;
import com.Maathacare.Backend.dto.AuthResponse;
import com.Maathacare.Backend.dto.UserRegistrationRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import com.Maathacare.Backend.security.JwtService;
import com.Maathacare.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    /**
     * Registers a new Mother and creates her associated MotherProfile.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest request) {
        try {
            // 1. Check if the user already exists using the phone number as user_id
            if (userRepository.findByUserId(request.getPhoneNumber()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Phone number already registered.");
            }

            // 2. Create and save the base User entity
            User newUser = new User();
            newUser.setUserId(request.getPhoneNumber());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setRole(Role.MOTHER);
            newUser.setActive(true);
            User savedUser = userRepository.save(newUser);

            // 3. Create the Mother Profile linked to the new User
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

            // 4. Persist the full profile to the database
            motherProfileRepository.save(profile);

            return ResponseEntity.status(HttpStatus.CREATED).body("Account and Profile created successfully!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating account: " + e.getMessage());
        }
    }

    /**
     * Standard Login for Mothers using Phone Number.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> requestData) {
        try {
            String phone = requestData.get("phoneNumber");
            String password = requestData.get("password");

            // Delegate to Service to handle token generation
            AuthResponse response = userService.loginUser(phone, password);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Secure Login for PHM Staff using Staff ID.
     */
    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(@RequestBody AuthRequest request) {
        // Use the centralized login logic to ensure consistency across the app
        try {
            AuthResponse response = userService.loginUser(request.getStaffId(), request.getPassword());

            // Safety check: ensure only PHM roles use this endpoint
            if (!response.getRole().equals("PHM")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only Staff allowed.");
            }

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Helper endpoint to generate test data for development.
     */
    @GetMapping("/staff/create-test")
    public ResponseEntity<String> createTestStaff() {
        if (userRepository.findByStaffId("PHM-100").isPresent()) {
            return ResponseEntity.ok("Test Midwife already exists!");
        }

        User testStaff = new User();
        testStaff.setUserId("999999999V"); // Internal ID
        testStaff.setStaffId("PHM-100");   // Login ID
        testStaff.setPasswordHash(passwordEncoder.encode("password123"));
        testStaff.setRole(Role.PHM);
        testStaff.setActive(true);

        userRepository.save(testStaff);
        return ResponseEntity.ok("Test Midwife Created! Staff ID: PHM-100 | Password: password123");
    }
}