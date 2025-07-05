import type { Message } from "./message"
import type { User } from "./user"

export interface Group {
  id: string
  name: string
  avatarUrl?: string
  createdBy: string
  members: string[]
  createdAt: string
  description?: string
  lastMessage?: Message
  unreadCount?: number
}

export interface ChatRoom {
  id: string
  type: "direct" | "group"
  name: string
  avatarUrl?: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
}
