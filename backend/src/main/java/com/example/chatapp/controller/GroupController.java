package com.example.chatapp.controller;

import com.example.chatapp.model.Group;
import com.example.chatapp.model.dto.GroupRequest;
import com.example.chatapp.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GroupController {
    
    private final GroupService groupService;
    
    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody GroupRequest request,
                                           Authentication authentication) {
        try {
            Group group = groupService.createGroup(request, authentication.getName());
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Group>> getUserGroups(Authentication authentication) {
        try {
            List<Group> groups = groupService.getUserGroups(authentication.getName());
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(@PathVariable String id,
                                           @RequestBody GroupRequest request,
                                           Authentication authentication) {
        try {
            Group group = groupService.updateGroup(id, request, authentication.getName());
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/members")
    public ResponseEntity<Group> addMember(@PathVariable String id,
                                         @RequestParam String memberId,
                                         Authentication authentication) {
        try {
            Group group = groupService.addMember(id, memberId, authentication.getName());
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Group> removeMember(@PathVariable String id,
                                            @PathVariable String memberId,
                                            Authentication authentication) {
        try {
            Group group = groupService.removeMember(id, memberId, authentication.getName());
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable String id,
                                          Authentication authentication) {
        try {
            groupService.deleteGroup(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
