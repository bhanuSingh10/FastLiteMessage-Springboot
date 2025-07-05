package com.example.chatapp.service;

import com.example.chatapp.model.Message;
import com.example.chatapp.model.User;
import com.example.chatapp.model.dto.MessageRequest;
import com.example.chatapp.repository.MessageRepository;
import com.example.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    
    public Message sendMessage(MessageRequest request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        Message message = Message.builder()
                .chatId(request.getChatId())
                .senderId(sender.getId())
                .receiverId(request.getReceiverId())
                .groupId(request.getGroupId())
                .content(request.getContent())
                .type(request.getType())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .build();
        
        return messageRepository.save(message);
    }
    
    public Page<Message> getMessages(String chatId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return messageRepository.findByChatIdOrderByTimestampDesc(chatId, pageable);
    }
    
    public Message updateMessage(String messageId, String content, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!message.getSenderId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to edit this message");
        }
        
        message.setContent(content);
        message.setEditedAt(LocalDateTime.now());
        
        return messageRepository.save(message);
    }
    
    public void deleteMessage(String messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!message.getSenderId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this message");
        }
        
        messageRepository.delete(message);
    }
    
    public Message reactToMessage(String messageId, String emoji, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Remove existing reaction from this user
        message.getReactions().removeIf(reaction -> reaction.getUserId().equals(user.getId()));
        
        // Add new reaction
        Message.MessageReaction reaction = Message.MessageReaction.builder()
                .emoji(emoji)
                .userId(user.getId())
                .userName(user.getName())
                .timestamp(LocalDateTime.now())
                .build();
        
        message.getReactions().add(reaction);
        
        return messageRepository.save(message);
    }
    
    public Message pinMessage(String messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // For now, allow anyone in the chat to pin/unpin messages
        message.setPinned(!message.getPinned());
        
        return messageRepository.save(message);
    }
    
    public Map<String, Object> searchMessages(String query, String chatId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Message> messagesPage;
        
        if (chatId != null && !chatId.isEmpty()) {
            messagesPage = messageRepository.findByChatIdAndContentContainingIgnoreCase(chatId, query, pageable);
        } else {
            messagesPage = messageRepository.findByContentContainingIgnoreCase(query, pageable);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("messages", messagesPage.getContent());
        result.put("totalCount", messagesPage.getTotalElements());
        result.put("hasMore", messagesPage.hasNext());
        
        return result;
    }
    
    public void markAsRead(String messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only mark as read if the user is the receiver
        if (message.getReceiverId() != null && message.getReceiverId().equals(user.getId())) {
            message.setStatus(Message.MessageStatus.READ);
            messageRepository.save(message);
        }
    }
}
