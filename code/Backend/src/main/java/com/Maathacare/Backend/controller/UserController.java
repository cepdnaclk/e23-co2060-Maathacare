package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.AuthRequest;
import com.Maathacare.Backend.dto.AuthResponse;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
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
@RequestMapping("/api/users") // 1. FIXED: Changed from /auth to /users to match your React Native app!
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    // 2. NEW: THE MISSING REGISTRATION ENDPOINT!
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> requestData) {
        try {
            // Catch the exact JSON data coming from your React Native app
            String phone = requestData.get("phoneNumber");
            String password = requestData.get("password");

            // Create the new Mother profile
            User newUser = new User();

            // Assuming you use the phone number as their primary User ID for logging in!
            newUser.setUserId(phone);
            newUser.setPasswordHash(passwordEncoder.encode(password));
            newUser.setRole(Role.MOTHER);
            newUser.setActive(true);

            userRepository.save(newUser);
            return ResponseEntity.ok("Account created successfully!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating account: " + e.getMessage());
        }
    }

    // 3. UPDATED: MOTHER LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> requestData) {
        try {
            // Safely catch the phoneNumber from Expo instead of looking for 'userId'
            String phone = requestData.get("phoneNumber");
            String password = requestData.get("password");

            // Uses the login engine we just perfected in UserService!
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