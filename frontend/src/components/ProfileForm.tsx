"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User, UserStats } from "@/types/user"
import { AvatarUploader } from "./AvatarUploader"
import { apiService } from "@/services/api"
import { useAuth } from "@/hooks/useAuth"

interface ProfileFormProps {
  user: User
  userStats?: UserStats
}

export function ProfileForm({ user, userStats }: ProfileFormProps) {
  const { updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || "",
    showOnlineStatus: user.privacySettings.showOnlineStatus,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedUser = await apiService.put<User>(`/api/users/${user.id}`, {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        privacySettings: {
          showOnlineStatus: formData.showOnlineStatus,
        },
      })

      updateUser(updatedUser)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpdate = (avatarUrl: string) => {
    updateUser({ avatarUrl })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUploader currentAvatarUrl={user.avatarUrl} onAvatarUpdate={handleAvatarUpdate} />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-online">Show Online Status</Label>
                <p className="text-sm text-muted-foreground">Let others see when you're online</p>
              </div>
              <Switch
                id="show-online"
                checked={formData.showOnlineStatus}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, showOnlineStatus: checked }))}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistics */}
      {userStats && (
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{userStats.totalMessages}</p>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDate(userStats.joinedAt)}</p>
                <p className="text-sm text-muted-foreground">Joined</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDate(userStats.lastSeen)}</p>
                <p className="text-sm text-muted-foreground">Last Seen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
