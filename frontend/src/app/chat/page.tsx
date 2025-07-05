"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react"; // Add X icon import
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../../components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    messages,
    chatRooms,
    currentChatId,
    setCurrentChatId,
    typingUsers,
    loading,
    hasMoreMessages,
    isConnected,
    initialized,
    currentUser,
    loadMessages,
    sendChatMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    pinMessage,
    sendTyping,
    createGroup,
    searchUsers,
    startDirectChat,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    setChatContainerRef
  } = useChat();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Debug logging
  useEffect(() => {
    console.log("🔍 CHAT PAGE DEBUG:");
    console.log("- Initialized:", initialized);
    console.log("- Chat Rooms Count:", chatRooms.length);
    console.log("- Current Chat ID:", currentChatId);
    console.log("- Messages Count:", messages.length);
    console.log("- Chat Rooms:", chatRooms);
  }, [initialized, chatRooms, currentChatId, messages]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentChat =
    chatRooms.find((room) => room.id === currentChatId) || null;
  const currentTypingUsers = typingUsers.filter(
    (typing) => typing.chatId === currentChatId
  );

  const handleLoadMore = () => {
    if (currentChatId && hasMoreMessages && !loading) {
      const page = Math.floor(messages.length / 50);
      loadMessages(currentChatId, page, 50);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (currentChatId) {
      sendTyping(currentChatId, isTyping);
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.trim()) {
      setIsCreatingGroup(true);
      try {
        await createGroup(
          groupName.trim(),
          groupDescription.trim() || undefined,
          selectedMembers // Pass selected members
        );

        // Close dialog and reset form
        setShowCreateGroup(false);
        setGroupName("");
        setGroupDescription("");
        setSelectedMembers([]);
        setMemberSearchQuery("");
        setSearchResults([]);

        // Success feedback could be added here (toast notification)
        console.log("Group created successfully!");
      } catch (error) {
        console.error("Failed to create group:", error);
        alert("Failed to create group. Please try again.");
      } finally {
        setIsCreatingGroup(false);
      }
    }
  };

  // Handle member search for group creation
  const handleMemberSearch = async (query: string) => {
    setMemberSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Failed to search users:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addMemberToGroup = (userId: string, userName: string) => {
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers((prev) => [...prev, userId]);
    }
    setMemberSearchQuery("");
    setSearchResults([]);
  };

  const removeMemberFromGroup = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 🆕 User Info Bar */}
      <div className="bg-card border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
            {currentUser?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-medium">
              Logged in as: {currentUser?.name || "Unknown User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentUser?.email || "No email"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <ChatSidebar
          chatRooms={chatRooms}
          currentChatId={currentChatId}
          onChatSelect={setCurrentChatId}
          onCreateGroup={() => setShowCreateGroup(true)}
          onSearchUsers={searchUsers}
          onStartDirectChat={startDirectChat}
        />

        <ChatWindow
          currentChat={currentChat}
          messages={messages}
          typingUsers={currentTypingUsers}
          currentUser={currentUser}
          onSendMessage={sendChatMessage}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          onReactToMessage={reactToMessage}
          onPinMessage={pinMessage}
          onTyping={handleTyping}
          onLoadMore={handleLoadMore}
          hasMoreMessages={hasMoreMessages}
          loading={loading}
          scrollToBottom={scrollToBottom}
          handleScroll={handleScroll}
          shouldAutoScroll={shouldAutoScroll}
          setChatContainerRef={setChatContainerRef}
        />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-md text-sm">
          Disconnected - Reconnecting...
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="group-description">Description (Optional)</Label>
              <Input
                id="group-description"
                placeholder="Enter group description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>

            {/* Member Selection */}
            <div>
              <Label htmlFor="member-search">Add Members (Optional)</Label>
              <Input
                id="member-search"
                placeholder="Search users to add..."
                value={memberSearchQuery}
                onChange={(e) => handleMemberSearch(e.target.value)}
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto border rounded-md">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                      onClick={() => addMemberToGroup(user.id, user.name)}
                    >
                      <span className="text-sm">{user.name}</span>
                      <Button size="sm" variant="ghost">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="mt-2">
                  <Label className="text-sm text-muted-foreground">
                    Selected Members:
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedMembers.map((memberId) => {
                      const member = searchResults.find(
                        (u) => u.id === memberId
                      );
                      return (
                        <div
                          key={memberId}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                        >
                          <span>{member?.name || memberId}</span>
                          <button
                            onClick={() => removeMemberFromGroup(memberId)}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateGroup(false);
                  setSelectedMembers([]);
                  setMemberSearchQuery("");
                  setSearchResults([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || isCreatingGroup}
              >
                {isCreatingGroup ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
