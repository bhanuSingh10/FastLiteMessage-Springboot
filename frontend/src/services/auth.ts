import { apiService } from "./api"
import type { User, LoginRequest, SignupRequest, AuthResponse } from "@/types/user"

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/api/auth/login", credentials)
    localStorage.setItem("accessToken", response.accessToken)
    return response
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/api/auth/signup", userData)
    localStorage.setItem("accessToken", response.accessToken)
    return response
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/api/auth/refresh")
    localStorage.setItem("accessToken", response.accessToken)
    return response
  }

  async logout(): Promise<void> {
    try {
      await apiService.post("/api/auth/logout")
    } finally {
      localStorage.removeItem("accessToken")
    }
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>("/api/users/me")
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken")
  }

  getToken(): string | null {
    return localStorage.getItem("accessToken")
  }
}

export const authService = new AuthService()
