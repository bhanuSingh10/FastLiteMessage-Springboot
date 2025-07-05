package com.example.chatapp.repository;

import com.example.chatapp.model.DirectChat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DirectChatRepository extends MongoRepository<DirectChat, String> {
    
    @Query("{'participants': {$all: [?0, ?1]}}")
    Optional<DirectChat> findByParticipants(String userId1, String userId2);
    
    @Query("{'participants': ?0}")
    List<DirectChat> findByParticipantsContaining(String userId);
}
