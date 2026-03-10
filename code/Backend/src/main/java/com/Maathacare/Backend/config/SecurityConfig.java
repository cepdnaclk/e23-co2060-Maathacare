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
import org.springframework.http.HttpMethod;

// 🚨 NEW IMPORTS NEEDED FOR CORS
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

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
                // 1. 🔓 ENABLE CORS SO EXPO CAN TALK TO SPRING BOOT
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Disable CSRF - Required for POST requests in stateless APIs
                .csrf(csrf -> csrf.disable())

                // 3. Set session management to STATELESS (Standard for JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 4. Configure endpoint access rules
                .authorizeHttpRequests(auth -> auth
                        // 🔓 NEW: ALWAYS allow the hidden mobile pre-flight checks!
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public endpoints (No token required)
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/staff/login",
                                "/api/auth/**",
                                "/api/users/staff/create-test",
                                "/api/weekly-milestones/**"
                        ).permitAll()
                        

                        // Protected endpoints (Accessible to any authenticated user)
                        .requestMatchers("/api/appointments/**").authenticated()
                        .requestMatchers("/api/phm/**").authenticated()

                        // Lockdown everything else
                        .anyRequest().authenticated()
                )

                // 5. Put our JWT Bouncer in front of the standard Spring Security bouncer!
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 🔓 THE VIP LIST FOR YOUR EXPO APP
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // Allow all IP addresses
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // OPTIONS is crucial for Axios!
        configuration.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}