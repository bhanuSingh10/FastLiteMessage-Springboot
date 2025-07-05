package com.example.chatapp.model.dto;

import lombok.Data;
import com.example.chatapp.model.User.PrivacySettings;

@Data
public class UserUpdateRequest {
    private String name;
    private String email;
    private String bio;
    private PrivacySettings privacySettings;
}
