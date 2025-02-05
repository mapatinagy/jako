export interface GalleryImage {
  id: number;
  filename: string;
  originalFilename: string;
  url?: string;
}

export interface UploadStatus {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
} 