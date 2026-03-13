package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.AuthRequest;
import com.Maathacare.Backend.dto.AuthResponse;
import com.Maathacare.Backend.dto.UserRegistrationRequest;
import com.Maathacare.Backend.dto.StaffRegistrationRequest; // 🚀 NEW DTO
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile; // 🚀 NEW IMPORT
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.PHMProfileRepository; // 🚀 NEW IMPORT
import com.Maathacare.Backend.repository.UserRepository;
import com.Maathacare.Backend.security.JwtService;
import com.Maathacare.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.Maathacare.Backend.dto.StaffResponse;
import java.util.ArrayList;
import java.util.List;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MotherProfileRepository motherProfileRepository;

    // 🚀 NEW: Required to update the PHM Table!
    @Autowired
    private PHMProfileRepository phmProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    // 🤱 MOTHER REGISTRATION (Existing)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest request) {
        try {
            if (userRepository.findById(request.getPhoneNumber()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Phone number already registered.");
            }

            User newUser = new User();
            newUser.setUserId(request.getPhoneNumber());
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

            motherProfileRepository.save(profile);

            return ResponseEntity.status(HttpStatus.CREATED).body("Mother Account and Profile created!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // 👩‍⚕️ DYNAMIC STAFF REGISTRATION (The "Professional" way)
    @PostMapping("/staff/register")
    public ResponseEntity<?> registerStaff(@RequestBody StaffRegistrationRequest request) {
        try {
            if (userRepository.findByStaffId(request.getStaffId()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Staff ID already in use.");
            }

            // 1. Create the Login Account
            User newStaff = new User();
            newStaff.setUserId(request.getNic());
            newStaff.setStaffId(request.getStaffId());
            newStaff.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newStaff.setRole(Role.PHM);
            newStaff.setActive(true);
            User savedUser = userRepository.save(newStaff);

            // 2. Create and Save the PHM Profile (Updates the PHM Table!)
            PHMProfile profile = new PHMProfile();
            profile.setUser(savedUser); // 🔗 Link them!
            profile.setFullName(request.getFullName());
            profile.setRegistrationNumber(request.getStaffId());
            profile.setMohArea(request.getMohArea());
            phmProfileRepository.save(profile);

            return ResponseEntity.status(HttpStatus.CREATED).body("Staff registered: " + request.getFullName());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> requestData) {
        try {
            String phone = requestData.get("phoneNumber");
            String password = requestData.get("password");
            return ResponseEntity.ok(userService.loginUser(phone, password));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(@RequestBody AuthRequest request) {
        User user = userRepository.findByStaffId(request.getStaffId()).orElse(null);
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Staff ID not found.");
        if (user.getRole() == Role.MOTHER) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied.");
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }
        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(user), user.getRole().name()));
    }

    // 🧪 UPDATED TEST ENDPOINT (Now updates both tables correctly)
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

        // 🚀 This makes sure the PHM table updates too!
        PHMProfile profile = new PHMProfile();
        profile.setUser(savedUser);
        profile.setFullName("Test Midwife");
        profile.setRegistrationNumber("PHM-100");
        phmProfileRepository.save(profile);

        return ResponseEntity.ok("Test Midwife and Profile Created!");
    }

    @GetMapping("/staff/all")
    public ResponseEntity<?> getAllStaff() {
        try {
            // Fetch all profiles from the database
            List<PHMProfile> profiles = phmProfileRepository.findAll();
            List<StaffResponse> staffList = new ArrayList<>();

            for (PHMProfile profile : profiles) {
                StaffResponse dto = new StaffResponse();
                dto.setFullName(profile.getFullName());
                dto.setStaffId(profile.getRegistrationNumber()); // We saved Staff ID here earlier
                dto.setMohArea(profile.getMohArea());

                if (profile.getUser() != null) {
                    dto.setNic(profile.getUser().getUserId()); // NIC is the user_id
                }
                staffList.add(dto);
            }

            return ResponseEntity.ok(staffList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching staff list: " + e.getMessage());
        }
    }

    // Add this inside UserController.java
    @GetMapping("/admin/setup")
    public ResponseEntity<String> setupMasterAdmin() {
        if (userRepository.findByStaffId("ADMIN-MASTER").isPresent()) {
            return ResponseEntity.ok("Master Admin already exists!");
        }

        User admin = new User();
        admin.setUserId("ADMIN-MASTER");
        admin.setStaffId("ADMIN-MASTER");
        admin.setPasswordHash(passwordEncoder.encode("admin123")); // Default password
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        return ResponseEntity.ok("Master Admin Created! ID: ADMIN-MASTER | Password: admin123");
    }

    // Add this inside UserController.java

    @DeleteMapping("/staff/delete/{staffId}")
    public ResponseEntity<?> deleteStaff(@PathVariable String staffId) {
        try {
            // 1. Find the User by Staff ID
            User user = userRepository.findByStaffId(staffId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Staff member not found.");
            }

            // 2. We need to delete the PHMProfile first to avoid Foreign Key errors
            // (Since the profile relies on the user account)
            List<PHMProfile> allProfiles = phmProfileRepository.findAll();
            for (PHMProfile profile : allProfiles) {
                if (staffId.equals(profile.getRegistrationNumber())) {
                    phmProfileRepository.delete(profile);
                    break;
                }
            }

            // 3. Now it is safe to delete the main User account
            userRepository.delete(user);

            return ResponseEntity.ok("Staff member removed successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting staff: " + e.getMessage());
        }
    }
}