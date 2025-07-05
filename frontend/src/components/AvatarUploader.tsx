"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { uploadService } from "@/services/uploads"

interface AvatarUploaderProps {
  currentAvatarUrl?: string
  onAvatarUpdate: (avatarUrl: string) => void
}

export function AvatarUploader({ currentAvatarUrl, onAvatarUpdate }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const response = await uploadService.uploadAvatar(file)
      onAvatarUpdate(response.url)
    } catch (error) {
      console.error("Avatar upload failed:", error)
      alert("Failed to upload avatar. Please try again.")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || currentAvatarUrl} />
          <AvatarFallback>
            <Camera className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>

        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={triggerFileSelect} disabled={uploading} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Photo"}
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <p className="text-sm text-muted-foreground text-center">
        Recommended: Square image, at least 200x200px
        <br />
        Max file size: 5MB
      </p>
    </div>
  )
}
