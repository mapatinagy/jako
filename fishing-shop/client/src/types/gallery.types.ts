export interface GalleryImage {
  id: number;
  filename: string;
  originalFilename: string;
  description: string | null;
  url?: string;
}

export interface UploadStatus {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
} 