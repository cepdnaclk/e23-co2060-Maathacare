package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.AuthResponse;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.UserRepository;
import com.Maathacare.Backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // We added the Token Factory!

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User registerNewUser(String userId, String password, Role role) {
        if (userRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("This phone number is already registered!");
        }

        User newUser = new User();
        newUser.setUserId(userId);
        newUser.setPasswordHash(passwordEncoder.encode(password));
        newUser.setRole(Role.MOTHER);

        newUser.setActive(true);

        return userRepository.save(newUser);
    }

    // NEW: The Login Engine
    public AuthResponse loginUser(String identifier, String password) {
        // Use the method name we just fixed in the Repository
        User user = userRepository.findByUserId(identifier)
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password!");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getRole().name());
    }
}