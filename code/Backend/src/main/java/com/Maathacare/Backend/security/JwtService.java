package com.Maathacare.Backend.security;

import com.Maathacare.Backend.model.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    // This is the master lock key used to sign the wristbands!
    private static final String SECRET_STRING = "MaathaCareSuperSecretKeyForJwtGeneration2026!";

    // We use this single, permanent key for BOTH generating and verifying!
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getUserId())
                .claim("role", user.getRole().name())
                .claim("userId", user.getUserId().toString())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // Valid for 24 hours
                .signWith(key)
                .compact();
    }

    // Read the phone number from the token
    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(key) // FIX: We now use the exact same key from the top of the file!
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Read the user's role from the token
    public String extractRole(String token) {
        return Jwts.parser()
                .verifyWith(key) // FIX: We now use the exact same key from the top of the file!
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
    }

    // Verify the token hasn't been tampered with
    public boolean isTokenValid(String token) {
        try {
            extractUsername(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Notice that we completely deleted the getSigningKey() method because it was causing the confusion!
}