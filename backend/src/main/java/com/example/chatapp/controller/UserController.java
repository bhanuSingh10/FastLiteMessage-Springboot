package com.example.chatapp.controller;

import com.example.chatapp.model.User;
import com.example.chatapp.model.dto.UserUpdateRequest;
import com.example.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        try {
            User user = userService.getCurrentUser(authentication.getName());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, 
                                         @RequestBody UserUpdateRequest request,
                                         Authentication authentication) {
        try {
            User currentUser = userService.getCurrentUser(authentication.getName());
            if (!currentUser.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            User updatedUser = userService.updateUser(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(Authentication authentication) {
        try {
            User user = userService.getCurrentUser(authentication.getName());
            Map<String, Object> stats = userService.getUserStats(user.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        try {
            List<User> users = userService.searchUsers(query);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/online")
    public ResponseEntity<Void> setOnlineStatus(@RequestParam boolean isOnline, 
                                              Authentication authentication) {
        try {
            userService.setOnlineStatus(authentication.getName(), isOnline);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
