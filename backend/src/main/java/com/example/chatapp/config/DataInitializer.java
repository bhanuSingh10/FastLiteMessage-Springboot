package com.example.chatapp.config;

import com.example.chatapp.model.User;
import com.example.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create test users if they don't exist
        createTestUserIfNotExists("test@example.com", "Test User", "password123");
        createTestUserIfNotExists("alice@example.com", "Alice Johnson", "password123");
        createTestUserIfNotExists("bob@example.com", "Bob Wilson", "password123");
        createTestUserIfNotExists("charlie@example.com", "Charlie Brown", "password123");
        createTestUserIfNotExists("diana@example.com", "Diana Prince", "password123");
        createTestUserIfNotExists("eve@example.com", "Eve Smith", "password123");
        createTestUserIfNotExists("frank@example.com", "Frank Miller", "password123");
        
        System.out.println("✅ Test users initialized!");
    }

    private void createTestUserIfNotExists(String email, String name, String password) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setBio("Test user created for development");
            user.setJoinedAt(LocalDateTime.now());
            user.setLastSeen(LocalDateTime.now());
            user.setIsOnline(false);
            
            userRepository.save(user);
            System.out.println("Created test user: " + name + " (" + email + ")");
        }
    }
}
