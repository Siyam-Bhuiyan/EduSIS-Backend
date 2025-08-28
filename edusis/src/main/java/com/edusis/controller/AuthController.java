package com.edusis.controller;

import com.edusis.dto.*;
import com.edusis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow all origins for simplicity
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@RequestBody LoginRequest loginRequest) {
        UserResponse user = userService.login(loginRequest);
        
        if (user != null) {
            return ResponseEntity.ok(
                ApiResponse.success("Login successful", user)
            );
        } else {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Invalid username or password")
            );
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody RegisterRequest registerRequest) {
        UserResponse user = userService.register(registerRequest);
        
        if (user != null) {
            return ResponseEntity.ok(
                ApiResponse.success("Registration successful", user)
            );
        } else {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Username or email already exists")
            );
        }
    }
}
