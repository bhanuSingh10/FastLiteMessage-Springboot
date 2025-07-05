"use client";

import { useState } from "react";
import { Search, Plus, Users, MessageCircle, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { ChatRoom } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  chatRooms: ChatRoom[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onCreateGroup: () => void;
  onSearchUsers?: (
    query: string
  ) => Promise<
    { id: string; name: string; email: string; avatarUrl?: string }[]
  >;
  onStartDirectChat?: (
    userId: string,
    userName: string
  ) => Promise<ChatRoom | void>;
}

export function ChatSidebar({
  chatRooms,
  currentChatId,
  onChatSelect,
  onCreateGroup,
  onSearchUsers,
  onStartDirectChat
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; email: string; avatarUrl?: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const filteredRooms = chatRooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSearch = async (query: string) => {
    if (!onSearchUsers || !query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await onSearchUsers(query.trim());
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (userId: string, userName: string) => {
    if (!onStartDirectChat) return;

    try {
      await onStartDirectChat(userId, userName);
      setShowUserSearch(false);
      setUserSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  return (
    <div className="w-80 bg-background border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Chats</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUserSearch(true)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onCreateGroup}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className={cn(
              "flex items-center gap-3 p-4 hover:bg-accent cursor-pointer border-b",
              currentChatId === room.id && "bg-accent"
            )}
            onClick={() => onChatSelect(room.id)}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={room.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback>
                  {room.type === "group" ? (
                    <Users className="h-6 w-6" />
                  ) : (
                    <MessageCircle className="h-6 w-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              {room.type === "direct" && room.participants[0]?.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">{room.name}</h3>
                {room.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(room.lastMessage.timestamp).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit"
                      }
                    )}
                  </span>
                )}
              </div>

              {room.lastMessage && (
                <p className="text-sm text-muted-foreground truncate">
                  {room.lastMessage.type === "TEXT"
                    ? room.lastMessage.content
                    : `📎 ${room.lastMessage.type.toLowerCase()}`}
                </p>
              )}
            </div>

            {room.unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                {room.unreadCount > 99 ? "99+" : room.unreadCount}
              </Badge>
            )}
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mb-2" />
            <p>No chats found</p>
          </div>
        )}
      </div>

      {/* User Search Dialog */}
      <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Search</DialogTitle>
          </DialogHeader>

          <div>
            <Input
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => {
                setUserSearchQuery(e.target.value);
                handleUserSearch(e.target.value);
              }}
              className="mb-4"
            />

            {isSearching && (
              <p className="text-sm text-muted-foreground">Searching...</p>
            )}

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleStartChat(user.id, user.name)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={user.avatarUrl || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          <UserPlus className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No users found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
