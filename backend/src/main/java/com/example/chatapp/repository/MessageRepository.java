package com.example.chatapp.repository;

import com.example.chatapp.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    Page<Message> findByChatIdOrderByTimestampDesc(String chatId, Pageable pageable);
    
    List<Message> findByChatIdAndPinnedTrue(String chatId);
    
    @Query("{'chatId': ?0, 'content': {$regex: ?1, $options: 'i'}}")
    Page<Message> findByChatIdAndContentContainingIgnoreCase(String chatId, String content, Pageable pageable);
    
    @Query("{'content': {$regex: ?0, $options: 'i'}}")
    Page<Message> findByContentContainingIgnoreCase(String content, Pageable pageable);
    
    long countBySenderId(String senderId);
    
    @Query("{'$or': [{'senderId': ?0, 'receiverId': ?1}, {'senderId': ?1, 'receiverId': ?0}]}")
    Page<Message> findDirectMessages(String userId1, String userId2, Pageable pageable);
    
    Page<Message> findByGroupId(String groupId, Pageable pageable);
}
