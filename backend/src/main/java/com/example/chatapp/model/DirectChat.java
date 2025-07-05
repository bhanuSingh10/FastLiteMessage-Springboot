package com.example.chatapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "direct_chats")
@CompoundIndex(def = "{'participants': 1}")
public class DirectChat {
    @Id
    private String id;
    
    private List<String> participants; // List of user IDs (always 2 for direct chat)
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private LocalDateTime lastActivity;
    
    // Generate a consistent ID for direct chats between two users
    public static String generateId(String userId1, String userId2) {
        List<String> sortedIds = new ArrayList<>(List.of(userId1, userId2));
        sortedIds.sort(String::compareTo);
        return "direct_" + String.join("_", sortedIds);
    }
}
