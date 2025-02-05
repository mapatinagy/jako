export interface GalleryImage {
  id: number;
  filename: string;
  original_filename: string;
  description: string | null;
  created_at: string;
  url?: string;
}

export interface UploadStatus {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
} 