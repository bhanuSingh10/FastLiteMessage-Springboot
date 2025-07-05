package com.example.chatapp.controller;

import com.example.chatapp.model.Message;
import com.example.chatapp.model.dto.MessageRequest;
import com.example.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MessageController {
    
    private final MessageService messageService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMessages(
            @RequestParam String chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Page<Message> messagesPage = messageService.getMessages(chatId, page, size);
            
            Map<String, Object> response = Map.of(
                "messages", messagesPage.getContent(),
                "hasMore", messagesPage.hasNext(),
                "totalElements", messagesPage.getTotalElements()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody MessageRequest request,
                                             Authentication authentication) {
        try {
            Message message = messageService.sendMessage(request, authentication.getName());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable String id,
                                               @RequestBody Map<String, String> request,
                                               Authentication authentication) {
        try {
            String content = request.get("content");
            Message message = messageService.updateMessage(id, content, authentication.getName());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id,
                                            Authentication authentication) {
        try {
            messageService.deleteMessage(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/react")
    public ResponseEntity<Message> reactToMessage(@PathVariable String id,
                                                @RequestBody Map<String, String> request,
                                                Authentication authentication) {
        try {
            String emoji = request.get("emoji");
            Message message = messageService.reactToMessage(id, emoji, authentication.getName());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/pin")
    public ResponseEntity<Message> pinMessage(@PathVariable String id,
                                            Authentication authentication) {
        try {
            Message message = messageService.pinMessage(id, authentication.getName());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchMessages(
            @RequestParam String query,
            @RequestParam(required = false) String chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Map<String, Object> result = messageService.searchMessages(query, chatId, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
