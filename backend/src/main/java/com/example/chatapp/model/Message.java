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
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    
    @Indexed
    private String chatId;
    
    @Indexed
    private String senderId;
    
    private String receiverId;
    
    private String groupId;
    
    private String content;
    
    @Builder.Default
    private MessageType type = MessageType.TEXT;
    
    @CreatedDate
    private LocalDateTime timestamp;
    
    @LastModifiedDate
    private LocalDateTime editedAt;
    
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;
    
    @Builder.Default
    private List<MessageReaction> reactions = new ArrayList<>();
    
    @Builder.Default
    private Boolean pinned = false;
    
    private String fileUrl;
    
    private String fileName;
    
    private Long fileSize;
    
    public enum MessageType {
        TEXT, IMAGE, FILE
    }
    
    public enum MessageStatus {
        SENT, DELIVERED, READ
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageReaction {
        private String emoji;
        private String userId;
        private String userName;
        private LocalDateTime timestamp;
    }
}
