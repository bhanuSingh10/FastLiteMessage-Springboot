"use client";

import type React from "react";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash, Pin, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { Message as MessageType } from "@/types/message";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: MessageType;
  currentUser: { id: string; name: string; email: string };
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onPin: (messageId: string) => void;
}

export function Message({
  message,
  currentUser,
  onEdit,
  onDelete,
  onReact,
  onPin
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const isOwnMessage = currentUser?.id === message.senderId;
  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setEditContent(message.content);
      setIsEditing(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getReactionCounts = () => {
    const counts: Record<string, number> = {};
    message.reactions.forEach((reaction) => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  const hasUserReacted = (emoji: string) => {
    return message.reactions.some(
      (reaction) =>
        reaction.emoji === emoji && reaction.userId === currentUser?.id
    );
  };

  return (
    <div className={cn("flex gap-3 group", isOwnMessage && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage
          src={
            isOwnMessage ? "/placeholder-user.jpg" : "/api/placeholder/32/32"
          }
        />
        <AvatarFallback>
          {isOwnMessage ? currentUser.name[0]?.toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex-1 max-w-[70%]",
          isOwnMessage && "flex flex-col items-end"
        )}
      >
        {message.pinned && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Pin className="h-3 w-3" />
            <span>Pinned message</span>
          </div>
        )}

        <div
          className={cn(
            "relative rounded-lg px-3 py-2",
            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {/* Message Content */}
          {isEditing ? (
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleEdit}
              className="bg-transparent border-none p-0 h-auto"
              autoFocus
            />
          ) : (
            <>
              {message.type === "TEXT" && (
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}

              {message.type === "IMAGE" && (
                <div className="space-y-2">
                  <img
                    src={message.fileUrl || "/placeholder.svg"}
                    alt={message.content}
                    className="max-w-full h-auto rounded"
                  />
                  {message.content && (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              )}

              {message.type === "FILE" && (
                <div className="flex items-center gap-2 p-2 bg-background/10 rounded">
                  <div className="flex-1">
                    <p className="font-medium">{message.content}</p>
                    {message.fileSize && (
                      <p className="text-xs opacity-70">
                        {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={message.fileUrl} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Message Actions */}
          {!isEditing && (
            <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReactions(!showReactions)}
                  className="h-6 w-6 p-0"
                >
                  😊
                </Button>

                {isOwnMessage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPin(message.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {message.pinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(message.id)}
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(getReactionCounts()).map(([emoji, count]) => (
              <Button
                key={emoji}
                size="sm"
                variant={hasUserReacted(emoji) ? "default" : "outline"}
                className="h-6 px-2 text-xs"
                onClick={() => onReact(message.id, emoji)}
              >
                {emoji} {count}
              </Button>
            ))}
          </div>
        )}

        {/* Quick Reactions */}
        {showReactions && (
          <div className="flex gap-1 mt-1">
            {emojis.map((emoji) => (
              <Button
                key={emoji}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => {
                  onReact(message.id, emoji);
                  setShowReactions(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}

        {/* Message Info */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1 text-xs text-muted-foreground",
            isOwnMessage && "flex-row-reverse"
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {message.editedAt && <span>(edited)</span>}
          {isOwnMessage && (
            <span
              className={cn(
                message.status === "READ" && "text-blue-500",
                message.status === "DELIVERED" && "text-green-500"
              )}
            >
              {message.status === "SENT" && "✓"}
              {message.status === "DELIVERED" && "✓✓"}
              {message.status === "READ" && "✓✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
