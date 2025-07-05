export interface Message {
  id: string
  chatId: string
  senderId: string
  receiverId?: string
  groupId?: string
  content: string
  type: "TEXT" | "IMAGE" | "FILE"
  timestamp: string
  status: "SENT" | "DELIVERED" | "READ"
  reactions: MessageReaction[]
  pinned: boolean
  editedAt?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
}

export interface MessageReaction {
  emoji: string
  userId: string
  userName: string
}

export interface TypingIndicator {
  chatId: string
  userId: string
  userName: string
  isTyping: boolean
}

export interface MessageSearchResult {
  messages: Message[]
  totalCount: number
  hasMore: boolean
}
