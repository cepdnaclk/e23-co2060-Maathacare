package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.AuthRequest;
import com.Maathacare.Backend.dto.AuthResponse;
import com.Maathacare.Backend.dto.UserRegistrationRequest; // 🟢 NEW IMPORT
import com.Maathacare.Backend.model.entity.MotherProfile; // 🟢 NEW IMPORT
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.MotherProfileRepository; // 🟢 NEW IMPORT
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

    // 🟢 NEW: We need this to save the profile data!
    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    // 🟢 UPDATED: NOW CATCHES THE DTO AND SAVES THE FULL PROFILE!
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest request) {
        try {
            // 1. (Optional but recommended) Check if the user already exists
            if (userRepository.findById(request.getPhoneNumber()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Phone number already registered.");
            }

            // 2. Create the base User (Login Credentials)
            User newUser = new User();
            newUser.setUserId(request.getPhoneNumber()); // Phone acts as User ID
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setRole(Role.MOTHER);
            newUser.setActive(true);

            // Save the user first so we can link it to the profile
            User savedUser = userRepository.save(newUser);

            // 3. Create the Mother Profile with all the new React Native data
            MotherProfile profile = new MotherProfile();
            profile.setUser(savedUser); // Link the profile to the login credentials
            profile.setFullName(request.getFullName());
            profile.setNic(request.getNic());
            profile.setDateOfBirth(request.getDateOfBirth());
            profile.setAddress(request.getAddress());
            profile.setEmergencyContactNumber(request.getEmergencyContactNumber());
            profile.setBloodGroup(request.getBloodGroup());
            profile.setLastMenstrualPeriod(request.getLastMenstrualPeriod());
            profile.setDistrict(request.getDistrict());
            profile.setProvince(request.getProvince());

            // 4. Save the full profile to the database!
            motherProfileRepository.save(profile);

            return ResponseEntity.status(HttpStatus.CREATED).body("Account and Profile created successfully!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating account: " + e.getMessage());
        }
    }

    // ----------------------------------------------------
    // UPDATED: MOTHER LOGIN ENDPOINT
    // ----------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> requestData) {
        try {
            String phone = requestData.get("phoneNumber");
            String password = requestData.get("password");

            AuthResponse response = userService.loginUser(phone, password);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ----------------------------------------------------
    // SECURE STAFF ENDPOINTS (Untouched!)
    // ----------------------------------------------------
    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(@RequestBody AuthRequest request) {

        User user = userRepository.findByStaffId(request.getStaffId()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Staff ID not found.");
        }

        if (user.getRole() == Role.MOTHER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You are not registered as Staff.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name()));
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

        userRepository.save(testStaff);
        return ResponseEntity.ok("Test Midwife Created! Staff ID: PHM-100 | Password: password123");
    }
}