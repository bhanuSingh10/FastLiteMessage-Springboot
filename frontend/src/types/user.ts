export interface User {
  id: string
  name: string
  email: string
  bio?: string
  avatarUrl?: string
  joinedAt: string
  lastSeen: string
  isOnline: boolean
  privacySettings: {
    showOnlineStatus: boolean
  }
  totalMessages?: number
}

export interface UserStats {
  totalMessages: number
  joinedAt: string
  lastSeen: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}
