package com.example.chatapp.service;

import com.example.chatapp.model.Group;
import com.example.chatapp.model.User;
import com.example.chatapp.model.dto.GroupRequest;
import com.example.chatapp.repository.GroupRepository;
import com.example.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {
    
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    
    public Group createGroup(GroupRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        
        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .createdBy(creator.getId())
                .members(request.getMembers())
                .build();
        
        // Add creator to members if not already included
        if (!group.getMembers().contains(creator.getId())) {
            group.getMembers().add(creator.getId());
        }
        
        return groupRepository.save(group);
    }
    
    public List<Group> getUserGroups(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return groupRepository.findByMembersContaining(user.getId());
    }
    
    public Group updateGroup(String groupId, GroupRequest request, String userEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only creator can update group
        if (!group.getCreatedBy().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this group");
        }
        
        if (request.getName() != null) {
            group.setName(request.getName());
        }
        if (request.getDescription() != null) {
            group.setDescription(request.getDescription());
        }
        if (request.getAvatarUrl() != null) {
            group.setAvatarUrl(request.getAvatarUrl());
        }
        
        return groupRepository.save(group);
    }
    
    public Group addMember(String groupId, String memberId, String userEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only creator or existing members can add new members
        if (!group.getCreatedBy().equals(user.getId()) && !group.getMembers().contains(user.getId())) {
            throw new RuntimeException("Unauthorized to add members to this group");
        }
        
        if (!group.getMembers().contains(memberId)) {
            group.getMembers().add(memberId);
            groupRepository.save(group);
        }
        
        return group;
    }
    
    public Group removeMember(String groupId, String memberId, String userEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only creator can remove members, or members can remove themselves
        if (!group.getCreatedBy().equals(user.getId()) && !memberId.equals(user.getId())) {
            throw new RuntimeException("Unauthorized to remove this member");
        }
        
        group.getMembers().remove(memberId);
        return groupRepository.save(group);
    }
    
    public void deleteGroup(String groupId, String userEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only creator can delete group
        if (!group.getCreatedBy().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this group");
        }
        
        groupRepository.delete(group);
    }
}
