package com.example.chatapp.model.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import com.example.chatapp.model.User;

@Data
@AllArgsConstructor
public class AuthResponse {
    private User user;
    private String accessToken;
}
