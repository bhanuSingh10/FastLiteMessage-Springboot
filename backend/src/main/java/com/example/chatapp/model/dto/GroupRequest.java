package com.example.chatapp.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class GroupRequest {
    private String name;
    private String description;
    private String avatarUrl;
    private List<String> members;
}
