export interface NewsPost {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  is_published: boolean;
  featured_image: string | null;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  is_published?: boolean;
  featured_image?: string | null;
}

export interface UpdateNewsRequest {
  title?: string;
  content?: string;
  is_published?: boolean;
  featured_image?: string | null;
}

export interface NewsListResponse {
  success: boolean;
  posts: NewsPost[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  published_only?: boolean;
} 