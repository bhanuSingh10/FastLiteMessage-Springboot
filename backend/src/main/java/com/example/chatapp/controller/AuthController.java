package com.example.chatapp.controller;

import com.example.chatapp.model.dto.AuthResponse;
import com.example.chatapp.model.dto.LoginRequest;
import com.example.chatapp.model.dto.SignupRequest;
import com.example.chatapp.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request, 
                                             HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.signup(request);
            
            // Set HTTP-only cookie for refresh token
            Cookie refreshCookie = new Cookie("refreshToken", authResponse.getAccessToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false); // Set to true in production with HTTPS
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(refreshCookie);
            
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                            HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);
            
            // Set HTTP-only cookie for refresh token
            Cookie refreshCookie = new Cookie("refreshToken", authResponse.getAccessToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false); // Set to true in production with HTTPS
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(refreshCookie);
            
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        try {
            if (refreshToken == null) {
                return ResponseEntity.badRequest().build();
            }
            
            AuthResponse authResponse = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication, HttpServletResponse response) {
        try {
            if (authentication != null) {
                authService.logout(authentication.getName());
            }
            
            // Clear refresh token cookie
            Cookie refreshCookie = new Cookie("refreshToken", "");
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(0);
            response.addCookie(refreshCookie);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
