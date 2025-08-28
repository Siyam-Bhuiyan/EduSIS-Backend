package com.edusis.service;

import com.edusis.dto.LoginRequest;
import com.edusis.dto.RegisterRequest;
import com.edusis.dto.UserResponse;
import com.edusis.model.User;
import com.edusis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserResponse login(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Simple password check (no hashing)
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return convertToUserResponse(user);
            }
        }
        return null;
    }
    
    public UserResponse register(RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return null;
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return null;
        }
        
        // Create new user
        User user = new User(
            registerRequest.getUsername(),
            registerRequest.getPassword(),
            registerRequest.getName(),
            registerRequest.getEmail(),
            registerRequest.getRole()
        );
        
        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }
    
    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getName(),
            user.getEmail(),
            user.getRole()
        );
    }
}
