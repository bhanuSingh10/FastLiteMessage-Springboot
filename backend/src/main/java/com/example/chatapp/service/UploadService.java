package com.example.chatapp.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class UploadService {
    
    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    
    @Value("${cloudinary.api-key}")
    private String apiKey;
    
    @Value("${cloudinary.api-secret}")
    private String apiSecret;
    
    private Cloudinary getCloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }
    
    public Map<String, String> uploadAvatar(MultipartFile file) throws IOException {
        Cloudinary cloudinary = getCloudinary();
        
        Map<String, Object> uploadParams = ObjectUtils.asMap(
            "folder", "chat-app/avatars",
            "transformation", ObjectUtils.asMap(
                "width", 200,
                "height", 200,
                "crop", "fill",
                "gravity", "face"
            )
        );
        
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        
        Map<String, String> result = new HashMap<>();
        result.put("url", uploadResult.get("secure_url").toString());
        result.put("publicId", uploadResult.get("public_id").toString());
        
        return result;
    }
    
    public Map<String, String> uploadMessageFile(MultipartFile file) throws IOException {
        Cloudinary cloudinary = getCloudinary();
        
        Map<String, Object> uploadParams = ObjectUtils.asMap(
            "folder", "chat-app/messages",
            "resource_type", "auto"
        );
        
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        
        Map<String, String> result = new HashMap<>();
        result.put("url", uploadResult.get("secure_url").toString());
        result.put("publicId", uploadResult.get("public_id").toString());
        
        return result;
    }
    
    public void deleteFile(String publicId) throws IOException {
        Cloudinary cloudinary = getCloudinary();
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
