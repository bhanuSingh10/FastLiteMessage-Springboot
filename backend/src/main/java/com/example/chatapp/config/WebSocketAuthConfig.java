package com.example.chatapp.config;

import com.example.chatapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {
    
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authToken = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authToken != null && authToken.startsWith("Bearer ")) {
                        String token = authToken.substring(7);
                        
                        try {
                            String username = jwtUtil.extractUsername(token);
                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                            
                            if (jwtUtil.validateToken(token, userDetails)) {
                                UsernamePasswordAuthenticationToken authentication = 
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                accessor.setUser(authentication);
                            }
                        } catch (Exception e) {
                            // Invalid token - connection will be rejected
                        }
                    }
                }
                
                return message;
            }
        });
    }
}
