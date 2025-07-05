package com.example.chatapp.repository;

import com.example.chatapp.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<User> findByNameContainingIgnoreCase(String name);
    
    @Query("{'email': {$regex: ?0, $options: 'i'}}")
    List<User> findByEmailContainingIgnoreCase(String email);
    
    List<User> findByIsOnlineTrue();
}
