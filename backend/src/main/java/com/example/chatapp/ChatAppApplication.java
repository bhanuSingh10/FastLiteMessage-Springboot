package com.example.chatapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class ChatAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatAppApplication.class, args);
    }
}
