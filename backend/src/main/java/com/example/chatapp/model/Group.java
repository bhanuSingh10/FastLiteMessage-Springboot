package com.example.chatapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    
    private String name;
    
    private String avatarUrl;
    
    private String createdBy;
    
    @Builder.Default
    private List<String> members = new ArrayList<>();
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private String description;
}
