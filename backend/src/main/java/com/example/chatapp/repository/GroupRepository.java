package com.example.chatapp.repository;

import com.example.chatapp.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
    @Query("{'members': ?0}")
    List<Group> findByMembersContaining(String userId);
    
    List<Group> findByCreatedBy(String createdBy);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<Group> findByNameContainingIgnoreCase(String name);
}
