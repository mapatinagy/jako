export interface GalleryImage {
  id: number;
  filename: string;
  original_filename: string;
  description: string | null;
  created_at: Date;
  file_size: number;
  mime_type: string;
  upload_status: 'pending' | 'completed' | 'failed';
  upload_error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  image?: GalleryImage;
  error?: string;
}

export interface UpdateImageRequest {
  description?: string;
}

export interface DeleteImagesRequest {
  imageIds: number[];
} 