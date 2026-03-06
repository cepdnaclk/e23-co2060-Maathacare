package com.Maathacare.Backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JWTAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 🔓 1. THE VIP BYPASS: Tell the JWT guard to step aside for Login, Register, and OPTIONS checks!
        String path = request.getServletPath();
        if (path.contains("/api/users/register") ||
                path.contains("/api/users/login") ||
                request.getMethod().equals("OPTIONS")) {

            filterChain.doFilter(request, response);
            return; // Exit the filter immediately without checking for a token!
        }

        // 2. Look for the "Authorization" header
        final String authHeader = request.getHeader("Authorization");

        // 3. If there is no token, let Spring Security block them automatically
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Extract the token (Remove "Bearer " from the string)
        final String jwt = authHeader.substring(7);
        final String userPhone = jwtService.extractUsername(jwt);

        // 5. If the token has a user, and they aren't already authenticated...
        if (userPhone != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 6. Verify the token signature is legit
            if (jwtService.isTokenValid(jwt)) {
                String role = jwtService.extractRole(jwt);

                // 7. Tell Spring Security: "This user is verified, let them in!"
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userPhone,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 8. Pass the request to the next step
        filterChain.doFilter(request, response);
    }
}