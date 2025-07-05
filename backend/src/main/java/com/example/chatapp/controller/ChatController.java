package com.example.chatapp.controller;

import com.example.chatapp.model.User;
import com.example.chatapp.model.Group;
import com.example.chatapp.model.DirectChat;
import com.example.chatapp.service.UserService;
import com.example.chatapp.service.GroupService;
import com.example.chatapp.service.DirectChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ChatController {
    
    private final UserService userService;
    private final GroupService groupService;
    private final DirectChatService directChatService;
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getChatRooms(Authentication authentication) {
        try {
            User currentUser = userService.getCurrentUser(authentication.getName());
            List<Map<String, Object>> chatRooms = new ArrayList<>();
            
            // Get user's groups
            List<Group> groups = groupService.getUserGroups(authentication.getName());
            for (Group group : groups) {
                Map<String, Object> chatRoom = new HashMap<>();
                chatRoom.put("id", group.getId());
                chatRoom.put("type", "group");
                chatRoom.put("name", group.getName());
                chatRoom.put("avatarUrl", group.getAvatarUrl());
                chatRoom.put("participants", group.getMembers());
                chatRoom.put("unreadCount", 0); // TODO: Implement unread count
                chatRooms.add(chatRoom);
            }
            
            // Get user's direct chats
            List<DirectChat> directChats = directChatService.getUserDirectChats(currentUser.getId());
            for (DirectChat directChat : directChats) {
                // Get the other participant's name
                String otherUserId = directChat.getParticipants().stream()
                    .filter(id -> !id.equals(currentUser.getId()))
                    .findFirst().orElse("Unknown");
                
                User otherUser = userService.getUserById(otherUserId);
                String chatName = otherUser != null ? otherUser.getName() : "Unknown User";
                
                Map<String, Object> chatRoom = new HashMap<>();
                chatRoom.put("id", directChat.getId());
                chatRoom.put("type", "direct");
                chatRoom.put("name", chatName);
                chatRoom.put("participants", directChat.getParticipants());
                chatRoom.put("unreadCount", 0); // TODO: Implement unread count
                chatRooms.add(chatRoom);
            }
            
            return ResponseEntity.ok(chatRooms);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/direct")
    public ResponseEntity<Map<String, Object>> createDirectChat(@RequestParam String userId,
                                                              Authentication authentication) {
        try {
            User currentUser = userService.getCurrentUser(authentication.getName());
            
            // Validate the target user exists
            User targetUser = userService.getUserById(userId);
            if (targetUser == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Target user not found"));
            }
            
            // Don't allow chat with self
            if (currentUser.getId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot create chat with yourself"));
            }
            
            // Create or get existing direct chat
            DirectChat directChat = directChatService.createOrGetDirectChat(currentUser.getId(), userId);
            
            Map<String, Object> chatRoom = new HashMap<>();
            chatRoom.put("id", directChat.getId());
            chatRoom.put("type", "direct");
            chatRoom.put("name", targetUser.getName());
            chatRoom.put("participants", directChat.getParticipants());
            chatRoom.put("unreadCount", 0);
            
            return ResponseEntity.ok(chatRoom);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create direct chat: " + e.getMessage()));
        }
    }
}
