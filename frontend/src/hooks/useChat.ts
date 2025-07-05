"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Message,
  MessageSearchResult,
  TypingIndicator
} from "@/types/message";
import type { ChatRoom } from "@/types/chat";
import { apiService } from "@/services/api";
import { useWebSocket } from "./useWebSocket";
import { useAuth } from "./useAuth";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Scroll management state
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const chatContainerRef = useRef<HTMLElement | null>(null);

  // Scroll management functions
  const scrollToBottom = useCallback(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer && shouldAutoScroll) {
      // Check if it's a ScrollArea viewport
      const viewport = chatContainer.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [shouldAutoScroll]);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    // Check if we're at the bottom (within 100px threshold)
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  }, []);

  // Set chat container ref function to be used by UI components
  const setChatContainerRef = useCallback(
    (element: HTMLElement | null) => {
      chatContainerRef.current = element;

      // Set up scroll listener for the ScrollArea viewport
      if (element) {
        const viewport = element.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (viewport) {
          viewport.addEventListener("scroll", handleScroll);
          // Store the viewport as the actual scroll container
          chatContainerRef.current = viewport;
        }
      }
    },
    [handleScroll]
  );

  // Get the authenticated user from useAuth context
  const { user: authenticatedUser } = useAuth();

  // Current user state - require authentication (no localStorage fallbacks)
  const currentUser = authenticatedUser;

  // Memoized WebSocket callback functions to prevent reconnection loops
  const handleMessageReceived = useCallback(
    (message: Message) => {
      console.log("📨 Received WebSocket message:", message);

      // Add to current chat if it matches - use callback form to get current value
      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;

        const newMessages = [...prev, message].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Auto-scroll to bottom when new message arrives
        setTimeout(scrollToBottom, 100);

        return newMessages;
      });

      // Update chat rooms with last message
      setChatRooms((prev) =>
        prev.map((room) =>
          room.id === message.chatId
            ? {
                ...room,
                lastMessage: message,
                unreadCount: room.unreadCount + 1
              }
            : room
        )
      );
    },
    [scrollToBottom]
  ); // Add scrollToBottom as dependency

  const handleTypingReceived = useCallback((typing: TypingIndicator) => {
    setTypingUsers((prev) => {
      const newMap = new Map(prev);
      if (typing.isTyping) {
        newMap.set(typing.userId, typing);
      } else {
        newMap.delete(typing.userId);
      }
      return newMap;
    });
  }, []);

  // WebSocket hooks
  const {
    isConnected,
    sendMessage: sendWebSocketMessage,
    sendTyping: sendWebSocketTyping,
    markAsRead: markAsReadWebSocket
  } = useWebSocket(handleMessageReceived, handleTypingReceived);

  // Backend API functions - searchUsers
  const searchUsers = async (query: string): Promise<any[]> => {
    if (!query.trim()) {
      return [];
    }

    try {
      console.log("🔍 Searching users via backend API:", query);
      const response = await apiService.get(
        `/api/users/search?query=${encodeURIComponent(query)}`
      );
      const users = Array.isArray(response) ? response : [];

      // Filter out current user from search results
      const filtered = users.filter((user: any) => user.id !== currentUser?.id);
      console.log("✅ Backend search results:", filtered);

      return filtered;
    } catch (error) {
      console.error("❌ Failed to search users:", error);
      return [];
    }
  };

  // Backend API functions - startDirectChat
  const startDirectChat = async (userId: string, userName: string) => {
    if (!currentUser?.id) {
      console.error("❌ No authenticated user");
      return;
    }

    try {
      console.log(
        `🚀 Starting direct chat with user: ${userName} (${userId}) from ${currentUser.name}`
      );

      // Call backend API to create or get direct chat
      const response = await apiService.post(
        `/api/chats/direct?userId=${userId}`,
        null
      );
      const chatRoom = response as any;
      console.log("✅ Direct chat created/retrieved:", chatRoom);

      // Create a proper ChatRoom object using backend response or fallback
      const newChatRoom: ChatRoom = {
        id:
          chatRoom?.id || `direct_${[currentUser.id, userId].sort().join("_")}`,
        type: "direct",
        name: chatRoom?.name || userName,
        participants: [
          {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email || `${currentUser.name}@example.com`,
            isOnline: true,
            joinedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            privacySettings: { showOnlineStatus: true }
          },
          {
            id: userId,
            name: userName,
            email: `${userName}@example.com`,
            isOnline: false,
            joinedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            privacySettings: { showOnlineStatus: true }
          }
        ],
        lastMessage: undefined,
        unreadCount: 0
      };

      // Add to chat rooms if not already present
      setChatRooms((prev) => {
        const exists = prev.some((room) => room.id === newChatRoom.id);
        if (exists) return prev;

        return [...prev, newChatRoom];
      });

      // Switch to the new chat
      setCurrentChatId(newChatRoom.id);
      console.log("🎯 Switched to direct chat:", newChatRoom.id);
    } catch (error) {
      console.error("❌ Failed to start direct chat:", error);
      console.error("Request details:", {
        userId,
        userName,
        currentUser: currentUser?.id,
        url: `/api/chats/direct?userId=${userId}`
      });

      // No fallback - rely on backend for all chat operations
      alert("Failed to start direct chat. Please try again.");
    }
  };

  // Message management
  const sendChatMessage = async (
    content: string,
    type: "TEXT" | "IMAGE" | "FILE" = "TEXT",
    fileUrl?: string
  ) => {
    if (!currentChatId || !currentUser?.id) {
      console.error(
        "❌ Cannot send message: no chat selected or user not authenticated"
      );
      return;
    }

    console.log(
      `💬 Sending message to chat ${currentChatId}: "${content}" from user: ${currentUser.name}`
    );

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newMessage: Message = {
      id: tempId,
      chatId: currentChatId,
      senderId: currentUser.id,
      content,
      type,
      timestamp: new Date().toISOString(),
      status: "SENT",
      reactions: [],
      pinned: false,
      fileUrl
    };

    // Add message immediately to UI
    setMessages((prev) => {
      const newMessages = [...prev, newMessage];
      // Auto-scroll to bottom when sending message
      setTimeout(scrollToBottom, 100);
      return newMessages;
    });

    try {
      // Prepare message for backend
      const messageRequest = {
        chatId: currentChatId,
        content,
        type,
        fileUrl
      };

      // For direct chats, find the receiver ID
      const currentChat = chatRooms.find((room) => room.id === currentChatId);
      if (currentChat?.type === "direct") {
        const receiverId = currentChat.participants.find(
          (p) => p.id !== currentUser.id
        )?.id;
        if (receiverId) {
          (messageRequest as any).receiverId = receiverId;
        }
      }

      // Send ONLY via API - this will save and trigger WebSocket delivery from backend
      console.log("📤 Sending message via API...");
      const savedMessage = await apiService.post(
        "/api/messages",
        messageRequest
      );
      console.log("✅ Message saved via API:", savedMessage);

      // Update the local message with the real message from backend
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.id === tempId
            ? { ...(savedMessage as Message), status: "DELIVERED" as const }
            : msg
        );
        // Auto-scroll to bottom after message is delivered
        setTimeout(scrollToBottom, 100);
        return updatedMessages;
      });
    } catch (error) {
      console.error("❌ Failed to send message:", error);

      // Update message status to failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "SENT" as const } : msg
        )
      );

      alert("Failed to send message. Please try again.");
    }
  };

  // Load messages from backend
  const loadMessages = async (
    chatId: string,
    page: number = 0,
    size: number = 50
  ) => {
    if (!currentUser?.id) return;

    console.log(`📥 Loading messages for chat: ${chatId}`);
    setLoading(true);

    try {
      // Load from backend API
      const response = await apiService.get(
        `/api/messages?chatId=${chatId}&page=${page}&size=${size}`
      );
      const data = response as any;
      const backendMessages = data?.messages || [];

      console.log(
        `📊 Backend returned ${backendMessages.length} messages for chat ${chatId}`
      );
      console.log("📊 Full response:", data);

      if (backendMessages && backendMessages.length > 0) {
        console.log("✅ Loaded messages from backend:", backendMessages.length);
        if (page === 0) {
          // Merge with existing messages, avoiding duplicates
          setMessages((prev) => {
            const newMessages = backendMessages.filter(
              (newMsg: Message) =>
                !prev.some((existingMsg) => existingMsg.id === newMsg.id)
            );
            const allMessages = [...prev, ...newMessages].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );

            // Auto-scroll to bottom after loading messages
            setTimeout(scrollToBottom, 100);

            return allMessages;
          });
        } else {
          setMessages((prev) => [...backendMessages, ...prev]);
        }
        setHasMoreMessages(data?.hasMore || false);
      } else {
        console.log("📭 No messages found for this chat");
        if (page === 0) {
          // Only clear if there are no existing messages
          setMessages((prev) => (prev.length === 0 ? [] : prev));
        }
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("❌ Failed to load messages:", error);
      if (page === 0) {
        setMessages([]);
      }
      setHasMoreMessages(false);
    } finally {
      setLoading(false);
    }
  };
  // Chat room operations
  const setCurrentChatIdWrapper = (chatId: string | null) => {
    setCurrentChatId(chatId);

    if (chatId) {
      // Clear existing messages first, then load new ones
      setMessages([]);
      setShouldAutoScroll(true); // Reset auto-scroll when switching chats
      loadMessages(chatId);
    }
  };

  // Search functionality
  const searchMessages = async (
    query: string,
    chatId?: string
  ): Promise<MessageSearchResult[]> => {
    console.log(
      `🔍 Searching messages: "${query}" in chat: ${chatId || "all"}`
    );

    try {
      const response = await apiService.get(
        `/api/messages/search?query=${encodeURIComponent(query)}${
          chatId ? `&chatId=${chatId}` : ""
        }`
      );
      return (response as MessageSearchResult[]) || [];
    } catch (error) {
      console.error("❌ Failed to search messages:", error);
      return [];
    }
  };

  // Typing indicators
  const sendTyping = (chatId: string, isTyping: boolean) => {
    if (isConnected && currentUser?.id) {
      sendWebSocketTyping(chatId, isTyping);
    }
  };

  // Additional message operations
  const editMessage = async (messageId: string, content: string) => {
    try {
      const response = await apiService.put(`/api/messages/${messageId}`, {
        content
      });
      console.log("✅ Message edited:", response);
      // Reload messages to get updated content
      if (currentChatId) {
        loadMessages(currentChatId);
      }
    } catch (error) {
      console.error("❌ Failed to edit message:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await apiService.delete(`/api/messages/${messageId}`);
      console.log("✅ Message deleted");
      // Remove from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("❌ Failed to delete message:", error);
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    try {
      const response = await apiService.post(
        `/api/messages/${messageId}/react`,
        { emoji }
      );
      console.log("✅ Reaction added:", response);
      // Reload messages to get updated reactions
      if (currentChatId) {
        loadMessages(currentChatId);
      }
    } catch (error) {
      console.error("❌ Failed to react to message:", error);
    }
  };

  const pinMessage = async (messageId: string) => {
    try {
      const response = await apiService.put(`/api/messages/${messageId}/pin`);
      console.log("✅ Message pinned:", response);
      // Reload messages to get updated pin status
      if (currentChatId) {
        loadMessages(currentChatId);
      }
    } catch (error) {
      console.error("❌ Failed to pin message:", error);
    }
  };

  const markAsRead = async (chatId: string, messageId: string) => {
    try {
      if (isConnected) {
        markAsReadWebSocket(messageId);
      } else {
        await apiService.post(`/api/messages/${messageId}/read`);
      }
      console.log("✅ Message marked as read");
    } catch (error) {
      console.error("❌ Failed to mark message as read:", error);
    }
  };

  const createGroup = async (
    name: string,
    description?: string,
    members: string[] = []
  ) => {
    try {
      const response = await apiService.post("/api/groups", {
        name,
        description,
        members // Include members array as expected by backend
      });
      console.log("✅ Group created:", response);
      // Reload chat rooms to include new group
      loadChatRooms();
      return response;
    } catch (error) {
      console.error("❌ Failed to create group:", error);
      throw error;
    }
  };

  const loadChatRooms = async () => {
    if (!currentUser?.id) return;

    console.log("🏠 Loading chat rooms...");
    setLoading(true);

    try {
      // Load from backend API (now includes both groups and direct chats)
      const response = await apiService.get("/api/chats");
      const backendRooms = Array.isArray(response) ? response : [];

      console.log("✅ Loaded chat rooms from backend:", backendRooms.length);

      // Convert backend format to our ChatRoom format
      const convertedRooms: ChatRoom[] = backendRooms.map((room: any) => ({
        id: room.id,
        type: room.type || "group",
        name: room.name,
        participants: room.participants || [],
        lastMessage: undefined,
        unreadCount: room.unreadCount || 0,
        avatarUrl: room.avatarUrl
      }));

      setChatRooms(convertedRooms);
    } catch (error) {
      console.error("❌ Failed to load chat rooms:", error);
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshChatRooms = () => {
    loadChatRooms();
  };

  // Set online status when user connects
  useEffect(() => {
    if (currentUser?.id) {
      // Set user as online
      apiService.post(`/api/users/online?isOnline=true`).catch(console.error);
    }
  }, [currentUser?.id]);

  // Initialize the hook
  useEffect(() => {
    if (!currentUser?.id) {
      console.log("⏳ Waiting for user authentication...");
      return;
    }

    console.log("🚀 Initializing chat system for user:", currentUser.name);

    loadChatRooms();
    setInitialized(true);

    // Cleanup: Set user as offline when component unmounts
    return () => {
      if (currentUser?.id) {
        apiService
          .post(`/api/users/online?isOnline=false`)
          .catch(console.error);
      }
    };
  }, [currentUser?.id]);

  // Auto-refresh messages every few seconds to get real-time updates
  useEffect(() => {
    if (!currentChatId || !initialized) return;

    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing messages for real-time updates...");
      // Only load new messages, don't replace existing ones - load fewer messages more frequently
      loadMessages(currentChatId, 0, 5); // Load only latest 5 messages
    }, 10000); // Check for new messages every 10 seconds (less aggressive)

    return () => clearInterval(interval);
  }, [currentChatId, initialized, loadMessages]); // Add loadMessages to dependencies

  // Cleanup when chat changes
  useEffect(() => {
    // No additional cleanup needed for WebSocket room management
    // since the useWebSocket hook handles connection management
  }, [currentChatId, isConnected]);

  return {
    // State
    messages,
    chatRooms,
    currentChatId,
    setCurrentChatId: setCurrentChatIdWrapper,
    currentUser,
    typingUsers: Array.from(typingUsers.values()),
    loading,
    hasMoreMessages,
    initialized,
    isConnected,

    // Actions
    sendChatMessage,
    loadMessages,
    searchMessages,
    searchUsers,
    startDirectChat,
    sendTyping,
    editMessage,
    deleteMessage,
    reactToMessage,
    pinMessage,
    markAsRead,
    createGroup,
    refreshChatRooms,

    // Scroll management
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    setChatContainerRef
  };
}
