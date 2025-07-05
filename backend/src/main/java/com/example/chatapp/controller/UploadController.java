package com.example.chatapp.controller;

import com.example.chatapp.service.UploadService;
import com.example.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UploadController {
    
    private final UploadService uploadService;
    private final UserService userService;
    
    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file,
                                                           Authentication authentication) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Map<String, String> result = uploadService.uploadAvatar(file);
            
            // Update user's avatar URL
            var user = userService.getCurrentUser(authentication.getName());
            userService.updateAvatar(user.getId(), result.get("url"));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> uploadMessageFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Map<String, String> result = uploadService.uploadMessageFile(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
