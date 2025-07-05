package com.example.chatapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private String passwordHash;
    
    private String bio;
    
    private String avatarUrl;
    
    @CreatedDate
    private LocalDateTime joinedAt;
    
    @LastModifiedDate
    private LocalDateTime lastSeen;
    
    @Builder.Default
    private Boolean isOnline = false;
    
    @Builder.Default
    private PrivacySettings privacySettings = new PrivacySettings();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrivacySettings {
        @Builder.Default
        private Boolean showOnlineStatus = true;
    }
}
