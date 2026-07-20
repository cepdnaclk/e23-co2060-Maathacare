package com.Maathacare.Backend.config;

import com.Maathacare.Backend.security.JWTAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthFilter;

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/staff/login",
                                "/api/auth/**",
                                "/api/weekly-milestones/**",
                                "/api/locations/**"
                        ).permitAll()

                        // Administrator web dashboard endpoints.
                        .requestMatchers("/api/users/staff/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/mothers/**").hasRole("ADMIN")

                        // Mother-owned profile endpoints.
                        .requestMatchers("/api/mothers/profile/**").hasRole("MOTHER")
                        .requestMatchers("/api/mothers/upload-profile-picture/**").hasRole("MOTHER")
                        .requestMatchers("/api/mothers/pregnancy-data/**").authenticated()

                        .requestMatchers("/api/appointments/**").authenticated()
                        .requestMatchers("/api/phm/**").authenticated()
                        .requestMatchers("/api/visits/**").authenticated()
                        .requestMatchers("/api/medical-records/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}