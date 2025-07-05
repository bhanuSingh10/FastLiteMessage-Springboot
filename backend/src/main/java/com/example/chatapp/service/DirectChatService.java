package com.example.chatapp.service;

import com.example.chatapp.model.DirectChat;
import com.example.chatapp.repository.DirectChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DirectChatService {
    
    private final DirectChatRepository directChatRepository;
    
    public DirectChat createOrGetDirectChat(String userId1, String userId2) {
        // Check if direct chat already exists
        Optional<DirectChat> existingChat = directChatRepository.findByParticipants(userId1, userId2);
        
        if (existingChat.isPresent()) {
            return existingChat.get();
        }
        
        // Create new direct chat
        String chatId = DirectChat.generateId(userId1, userId2);
        DirectChat directChat = DirectChat.builder()
                .id(chatId)
                .participants(List.of(userId1, userId2))
                .createdAt(LocalDateTime.now())
                .lastActivity(LocalDateTime.now())
                .build();
        
        return directChatRepository.save(directChat);
    }
    
    public List<DirectChat> getUserDirectChats(String userId) {
        return directChatRepository.findByParticipantsContaining(userId);
    }
    
    public void updateLastActivity(String chatId) {
        Optional<DirectChat> chat = directChatRepository.findById(chatId);
        if (chat.isPresent()) {
            DirectChat directChat = chat.get();
            directChat.setLastActivity(LocalDateTime.now());
            directChatRepository.save(directChat);
        }
    }
}
