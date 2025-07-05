import { apiService } from "./api"

export interface UploadResponse {
  url: string
  publicId: string
}

class UploadService {
  async uploadAvatar(file: File): Promise<UploadResponse> {
    return apiService.uploadFile("/api/uploads/avatar", file)
  }

  async uploadMessageFile(file: File): Promise<UploadResponse> {
    return apiService.uploadFile("/api/uploads/message", file)
  }
}

export const uploadService = new UploadService()
