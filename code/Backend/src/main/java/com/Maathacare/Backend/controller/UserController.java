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

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    // 1. MOTHER LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            // Uses the login engine we just perfected in UserService!
            AuthResponse response = userService.loginUser(request.getUserId(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // 2. SECURE STAFF LOGIN ENDPOINT
    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(@RequestBody AuthRequest request) {

        // 1. Find the user by their Staff ID.
        User user = userRepository.findByStaffId(request.getStaffId())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Staff ID not found.");
        }

        // 2. Verify they are ACTUALLY staff (Security check!)
        if (user.getRole() == Role.MOTHER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You are not registered as Staff.");
        }

        // 3. Check the password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }

        // 4. Generate the VIP Staff Token!
        String token = jwtService.generateToken(user);

        // 5. Send back the token AND their role!
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name()));
    }

    // ----------------------------------------------------
    // 🛑 TEMPORARY CHEAT CODE TO CREATE A TEST MIDWIFE 🛑
    // (We will delete this later once we build the Admin portal)
    // ----------------------------------------------------
    @GetMapping("/staff/create-test")
    public ResponseEntity<String> createTestStaff() {
        // Check if we already made one so it doesn't crash
        if (userRepository.findByStaffId("PHM-100").isPresent()) {
            return ResponseEntity.ok("Test Midwife already exists!");
        }

        User testStaff = new User();
        testStaff.setUserId("999999999V"); // Dummy NIC
        testStaff.setStaffId("PHM-100");
        testStaff.setPasswordHash(passwordEncoder.encode("password123")); // Properly encrypts it!
        testStaff.setRole(Role.PHM);
        testStaff.setActive(true);

        userRepository.save(testStaff);
        return ResponseEntity.ok("Test Midwife Created! Staff ID: PHM-100 | Password: password123");
    }
}