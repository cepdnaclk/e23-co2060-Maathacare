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
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Authentication and public onboarding routes.
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/staff/login",
                                "/api/auth/**",
                                "/api/weekly-milestones/**",
                                "/api/visits/**",
                                "/api/locations/**"
                        ).permitAll()

                        // Mother-only routes.
                        .requestMatchers("/api/mothers/profile/**").hasRole("MOTHER")
                        .requestMatchers("/api/kicks/**").hasRole("MOTHER")
                        .requestMatchers("/api/mothers/upload-profile-picture/**").hasRole("MOTHER")
                        .requestMatchers("/api/mothers/pregnancy-data/**").permitAll()
                        .requestMatchers("/api/mothers/symptoms/**").hasRole("MOTHER")

                        // Every staff management route requires a valid ADMIN JWT.
                        // Do not skip these routes in JWTAuthenticationFilter.
                        .requestMatchers("/api/users/staff/**").hasRole("ADMIN")

                        // PHMs can use their own portal; admins may inspect it too.
                        .requestMatchers("/api/phm/**").hasAnyRole("PHM", "ADMIN")

                        .requestMatchers("/api/appointments/**").authenticated()
                        .requestMatchers("/api/medical-records/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Bearer-token authentication does not require allowCredentials=true.
        // For production, replace "*" with the deployed frontend URL.
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}