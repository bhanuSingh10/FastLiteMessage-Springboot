package com.example.chatapp.model.dto;

import lombok.Data;
import com.example.chatapp.model.Message.MessageType;

@Data
public class MessageRequest {
    private String chatId;
    private String receiverId;
    private String groupId;
    private String content;
    private MessageType type;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
}
