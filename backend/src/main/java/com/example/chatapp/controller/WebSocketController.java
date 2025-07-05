package com.example.chatapp.controller;

import com.example.chatapp.model.Message;
import com.example.chatapp.model.dto.MessageRequest;
import com.example.chatapp.service.MessageService;
import com.example.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class WebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserService userService;
    
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest messageRequest, Principal principal) {
        try {
            Message message = messageService.sendMessage(messageRequest, principal.getName());
            
            // Send to specific chat room topic (all participants will get it)
            messagingTemplate.convertAndSend("/topic/chat." + message.getChatId(), message);
            
            // For direct chats, also send to each participant's personal queue
            if (message.getChatId().startsWith("direct_")) {
                // Extract user IDs from direct chat ID format: "direct_userId1_userId2"
                String[] parts = message.getChatId().split("_");
                if (parts.length >= 3) {
                    String userId1 = parts[1];
                    String userId2 = parts[2];
                    
                    // Send to both participants' personal queues
                    messagingTemplate.convertAndSendToUser(userId1, "/queue/messages", message);
                    messagingTemplate.convertAndSendToUser(userId2, "/queue/messages", message);
                }
            }
            
            // Send to receiver's personal queue if receiverId is explicitly set
            if (message.getReceiverId() != null) {
                messagingTemplate.convertAndSendToUser(
                    message.getReceiverId(), 
                    "/queue/messages", 
                    message
                );
            }
            
            // Send to group members if it's a group message
            if (message.getGroupId() != null) {
                messagingTemplate.convertAndSend("/topic/group." + message.getGroupId(), message);
            }
            
        } catch (Exception e) {
            // Handle error - could send error message back to sender
            messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                Map.of("error", "Failed to send message: " + e.getMessage())
            );
        }
    }
    
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> typingData, Principal principal) {
        try {
            String chatId = (String) typingData.get("chatId");
            Boolean isTyping = (Boolean) typingData.get("isTyping");
            
            var user = userService.getCurrentUser(principal.getName());
            
            Map<String, Object> typingIndicator = Map.of(
                "chatId", chatId,
                "userId", user.getId(),
                "userName", user.getName(),
                "isTyping", isTyping
            );
            
            // Broadcast typing indicator to chat room
            messagingTemplate.convertAndSend("/topic/chat." + chatId + ".typing", typingIndicator);
            
        } catch (Exception e) {
            // Handle error silently for typing indicators
        }
    }
    
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Map<String, String> readData, Principal principal) {
        try {
            String messageId = readData.get("messageId");
            messageService.markAsRead(messageId, principal.getName());
            
            // Optionally broadcast read receipt
            messagingTemplate.convertAndSend("/topic/read." + messageId, Map.of(
                "messageId", messageId,
                "readBy", principal.getName()
            ));
            
        } catch (Exception e) {
            // Handle error silently
        }
    }
}
