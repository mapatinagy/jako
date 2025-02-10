// Base URLs from environment
export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const API_URL = import.meta.env.VITE_API_URL;
export const UPLOADS_URL = `${BASE_URL}/uploads`;

// Auth endpoints
export const authEndpoints = {
  login: `${API_URL}/auth/login`,
  verifyToken: `${API_URL}/auth/verify`,
  securityQuestions: `${API_URL}/auth/security-questions`,
  updateSettings: `${API_URL}/auth/update-settings`,
  getRecoveryQuestions: `${API_URL}/auth/get-recovery-questions`,
  verifySecurityAnswers: `${API_URL}/auth/verify-security-answers`,
  resetPassword: `${API_URL}/auth/reset-password`,
  userData: `${API_URL}/auth/user-data`,
};

// Gallery endpoints
export const galleryEndpoints = {
  images: `${API_URL}/gallery/images`,
  uploadImage: `${API_URL}/gallery/upload`,
  updateImage: (id: number) => `${API_URL}/gallery/images/${id}`,
  deleteImages: `${API_URL}/gallery/images`,
};

// News endpoints
export const newsEndpoints = {
  list: `${API_URL}/news/posts`,
  create: `${API_URL}/news/posts`,
  uploadImage: `${API_URL}/news/upload-image`,
  singlePost: (id: number) => `${API_URL}/news/posts/${id}`,
  update: (id: number) => `${API_URL}/news/posts/${id}`,
  delete: (id: number) => `${API_URL}/news/posts/${id}`,
  togglePublish: (id: number) => `${API_URL}/news/posts/${id}/toggle-publish`,
};

// Utility functions for URLs
export const getUploadUrl = (filename: string) => `${UPLOADS_URL}/${filename}`;
export const getApiUrl = (path: string) => `${API_URL}${path}`;

// Common fetch configurations
export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

// API response types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;  // Allow for additional properties
}

interface LoginResponse extends ApiResponse {
  token: string;
}

// Fetch utilities
export const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

// Common API functions
export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) => 
    fetchWithAuth<LoginResponse>(authEndpoints.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getUserData: () =>
    fetchWithAuth<ApiResponse>(authEndpoints.userData),
  getSecurityQuestions: () =>
    fetchWithAuth<ApiResponse>(authEndpoints.securityQuestions),
  getRecoveryQuestions: (data: { username?: string; email?: string }) =>
    fetchWithAuth<ApiResponse>(authEndpoints.getRecoveryQuestions, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifySecurityAnswers: (data: { username?: string; email?: string; answers: string[] }) =>
    fetchWithAuth<ApiResponse>(authEndpoints.verifySecurityAnswers, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetPassword: (data: { username: string; newPassword: string; answers: string[] }) =>
    fetchWithAuth<ApiResponse>(authEndpoints.resetPassword, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSettings: (data: any) =>
    fetchWithAuth<ApiResponse>(authEndpoints.updateSettings, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Gallery
  getImages: () => fetchWithAuth<ApiResponse>(galleryEndpoints.images),
  uploadImage: (formData: FormData) => 
    fetchWithAuth<ApiResponse>(galleryEndpoints.uploadImage, {
      method: 'POST',
      body: formData,
      headers: { ...getAuthHeader() }, // Don't include Content-Type for FormData
    }),
  updateImage: (id: number, data: any) =>
    fetchWithAuth<ApiResponse>(galleryEndpoints.updateImage(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteImages: (imageIds: number[]) =>
    fetchWithAuth<ApiResponse>(galleryEndpoints.deleteImages, {
      method: 'DELETE',
      body: JSON.stringify({ imageIds }),
    }),

  // News
  getPosts: () => fetchWithAuth<ApiResponse>(newsEndpoints.list),
  getPost: (id: number) => fetchWithAuth<ApiResponse>(newsEndpoints.singlePost(id)),
  createPost: (data: any) =>
    fetchWithAuth<ApiResponse>(newsEndpoints.create, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePost: (id: number, data: any) =>
    fetchWithAuth<ApiResponse>(newsEndpoints.update(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deletePost: (id: number) =>
    fetchWithAuth<ApiResponse>(newsEndpoints.delete(id), {
      method: 'DELETE',
    }),
  togglePostPublish: (id: number) =>
    fetchWithAuth<ApiResponse>(newsEndpoints.togglePublish(id), {
      method: 'PATCH',
    }),
  uploadNewsImage: (formData: FormData) =>
    fetchWithAuth<ApiResponse>(newsEndpoints.uploadImage, {
      method: 'POST',
      body: formData,
      headers: { ...getAuthHeader() }, // Don't include Content-Type for FormData
    }),
}; 