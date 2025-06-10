export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  created_at: string;
  image_url?: string;
  user_id: string;
}

export interface CreateBlogPost {
  title: string;
  excerpt: string;
  content: string;
  image_url?: string;
} 