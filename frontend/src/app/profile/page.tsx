"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "@/components/ProfileForm"
import { useAuth } from "@/hooks/useAuth"
import type { UserStats } from "@/types/user"
import { apiService } from "@/services/api"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      loadUserStats()
    }
  }, [user, authLoading, router])

  const loadUserStats = async () => {
    try {
      const stats = await apiService.get<UserStats>("/api/users/stats")
      setUserStats(stats)
    } catch (error) {
      console.error("Failed to load user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-lg font-semibold">Profile Settings</h1>

          <div className="ml-auto">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <ProfileForm user={user} userStats={userStats} />
      </div>
    </div>
  )
}
