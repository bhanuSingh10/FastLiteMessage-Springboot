"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { Message, TypingIndicator } from "@/types/message";
import { useAuth } from "./useAuth";

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: Omit<Message, "id" | "timestamp" | "status">) => void;
  sendTyping: (chatId: string, isTyping: boolean) => void;
  markAsRead: (messageId: string) => void;
}

export function useWebSocket(
  onMessageReceived: (message: Message) => void,
  onTypingReceived: (typing: TypingIndicator) => void
): UseWebSocketReturn {
  const { user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use refs to store the latest callback functions to avoid reconnection loops
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onTypingReceivedRef = useRef(onTypingReceived);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    onTypingReceivedRef.current = onTypingReceived;
  }, [onTypingReceived]);

  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws/chat`),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      },
      debug: (str) => {
        console.log("STOMP: " + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log("🔌 WebSocket connected, setting up subscriptions...");

      // Subscribe to personal message queue
      client.subscribe(`/user/queue/messages`, (message) => {
        console.log("📨 Received message from personal queue:", message.body);
        const receivedMessage: Message = JSON.parse(message.body);
        onMessageReceivedRef.current(receivedMessage);
      });

      // Subscribe to typing indicators
      client.subscribe(`/user/queue/typing`, (message) => {
        const typingIndicator: TypingIndicator = JSON.parse(message.body);
        onTypingReceivedRef.current(typingIndicator);
      });

      console.log("✅ WebSocket subscriptions set up successfully");
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [user]); // Only depend on user, not the callback functions

  const sendMessage = (
    message: Omit<Message, "id" | "timestamp" | "status">
  ) => {
    if (clientRef.current && isConnected) {
      console.log("📤 Sending WebSocket message:", message);
      clientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(message)
      });
    } else {
      console.error("❌ Cannot send WebSocket message - not connected");
    }
  };

  const sendTyping = (chatId: string, isTyping: boolean) => {
    if (clientRef.current && isConnected) {
      clientRef.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({ chatId, isTyping })
      });
    }
  };

  const markAsRead = (messageId: string) => {
    if (clientRef.current && isConnected) {
      clientRef.current.publish({
        destination: "/app/chat.read",
        body: JSON.stringify({ messageId })
      });
    }
  };

  return {
    isConnected,
    sendMessage,
    sendTyping,
    markAsRead
  };
}
