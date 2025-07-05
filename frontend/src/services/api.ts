const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          // Try to parse as JSON first
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.message || errorText;
          } catch {
            // If not JSON, use the text as is
            errorMessage = errorText;
          }
        }
      } catch {
        // If we can't read the response, use the default message
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      // Return empty object if no JSON content
      return {} as T;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders(),
      credentials: "include"
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers: HeadersInit = {};
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Only set Content-Type if we have data to send
    if (data !== null && data !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body:
        data !== null && data !== undefined ? JSON.stringify(data) : undefined
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });
    return this.handleResponse<T>(response);
  }

  async uploadFile(endpoint: string, file: File): Promise<any> {
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      credentials: "include",
      body: formData
    });

    return this.handleResponse(response);
  }

  // Group methods
  async createGroup(data: {
    name: string;
    description?: string;
    members?: string[];
  }): Promise<any> {
    return this.post("/api/groups", data);
  }
}

export const apiService = new ApiService();
