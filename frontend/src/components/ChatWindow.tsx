"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, MoreVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Message as MessageComponent } from "./Message";
import type { Message, TypingIndicator } from "@/types/message";
import type { ChatRoom } from "@/types/chat";
import { uploadService } from "@/services/uploads";

interface ChatWindowProps {
  currentChat: ChatRoom | null;
  messages: Message[];
  typingUsers: TypingIndicator[];
  currentUser: { id: string; name: string; email: string } | null; // Allow null
  onSendMessage: (
    content: string,
    type?: "TEXT" | "IMAGE" | "FILE",
    fileUrl?: string
  ) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onPinMessage: (messageId: string) => void;
  onTyping: (isTyping: boolean) => void;
  onLoadMore: () => void;
  hasMoreMessages: boolean;
  loading: boolean;
  // Scroll management functions from useChat
  scrollToBottom?: () => void;
  handleScroll?: (e: Event) => void;
  shouldAutoScroll?: boolean;
  setChatContainerRef?: (element: HTMLElement | null) => void;
}

export function ChatWindow({
  currentChat,
  messages,
  typingUsers,
  currentUser, // Add to destructured props
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onPinMessage,
  onTyping,
  onLoadMore,
  hasMoreMessages,
  loading,
  scrollToBottom: externalScrollToBottom,
  handleScroll: externalHandleScroll,
  shouldAutoScroll: externalShouldAutoScroll,
  setChatContainerRef
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Use external scroll function from useChat hook if available, otherwise use local implementation
  const scrollToBottom =
    externalScrollToBottom ||
    (() => {
      // Try to scroll the ScrollArea viewport instead of just the messages end ref
      const scrollContainer = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });

  // Set up scroll listener for the external handleScroll function
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (scrollContainer) {
      // Set the container ref for useChat scroll management
      setChatContainerRef?.(scrollContainer);

      // Add scroll listener if external handler is provided
      if (externalHandleScroll) {
        scrollContainer.addEventListener("scroll", externalHandleScroll);
        return () =>
          scrollContainer.removeEventListener("scroll", externalHandleScroll);
      }
    }
  }, [externalHandleScroll, setChatContainerRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    onSendMessage(messageInput.trim());
    setMessageInput("");
    handleStopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isImage = file.type.startsWith("image/");
      const uploadResponse = await uploadService.uploadMessageFile(file);

      onSendMessage(file.name, isImage ? "IMAGE" : "FILE", uploadResponse.url);
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">
            Select a chat to start messaging
          </h3>
          <p className="text-muted-foreground">
            Choose from your existing conversations or start a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentChat.avatarUrl || "/placeholder.svg"} />
            <AvatarFallback>{currentChat.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{currentChat.name}</h3>
            {currentChat.type === "direct" &&
              currentChat.participants[0]?.isOnline && (
                <p className="text-sm text-green-600">Online</p>
              )}
            {currentChat.type === "group" && (
              <p className="text-sm text-muted-foreground">
                {currentChat.participants.length} members
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          {hasMoreMessages && (
            <div className="text-center mb-4">
              <Button variant="ghost" onClick={onLoadMore} disabled={loading}>
                {loading ? "Loading..." : "Load more messages"}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                currentUser={currentUser || { id: "", name: "", email: "" }} // Provide fallback
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                onReact={onReactToMessage}
                onPin={onPinMessage}
              />
            ))}
          </div>

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
              <span>
                {typingUsers.map((user) => user.userName).join(", ")}
                {typingUsers.length === 1 ? " is" : " are"} typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-background flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4 bg-background border rounded-lg p-2 shadow-lg">
            <div className="grid grid-cols-6 gap-1">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMessageInput((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
}
