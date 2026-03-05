package com.Maathacare.Backend.config;

import com.Maathacare.Backend.security.JWTAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthFilter;

    // Inject the Filter
    public SecurityConfig(JWTAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Disable CSRF - Required for POST requests in stateless APIs
                .csrf(csrf -> csrf.disable())

                // 2. Set session management to STATELESS (Standard for JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/register", "/api/users/login", "/api/auth/**").permitAll()
         
                // Put our JWT Bouncer in front of the standard Spring Security bouncer!
                        // Public endpoints
                        .requestMatchers("/api/users/register", "/api/users/login").permitAll()

                        // Appointment endpoints - Accessible to any authenticated user
                        .requestMatchers("/api/appointments/**").authenticated()

                        // PHM Setup endpoints
                        .requestMatchers("/api/phm/**").authenticated()

                        // Lockdown everything else
                        .anyRequest().authenticated()
                )

                // 3. Add our JWT Filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}