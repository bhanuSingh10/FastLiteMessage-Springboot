package com.example.chatapp.service;

import com.example.chatapp.model.User;
import com.example.chatapp.model.dto.UserUpdateRequest;
import com.example.chatapp.repository.UserRepository;
import com.example.chatapp.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElse(null);
    }
    
    public User updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getPrivacySettings() != null) {
            user.setPrivacySettings(request.getPrivacySettings());
        }
        
        return userRepository.save(user);
    }
    
    public void updateAvatar(String userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }
    
    public Map<String, Object> getUserStats(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        long totalMessages = messageRepository.countBySenderId(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMessages", totalMessages);
        stats.put("joinedAt", user.getJoinedAt());
        stats.put("lastSeen", user.getLastSeen());
        
        return stats;
    }
    
    public List<User> searchUsers(String query) {
        List<User> users = userRepository.findByNameContainingIgnoreCase(query);
        users.addAll(userRepository.findByEmailContainingIgnoreCase(query));
        return users.stream().distinct().toList();
    }
    
    public void updateLastSeen(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);
    }
    
    public void setOnlineStatus(String email, boolean isOnline) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsOnline(isOnline);
        if (!isOnline) {
            user.setLastSeen(LocalDateTime.now());
        }
        userRepository.save(user);
    }
}
