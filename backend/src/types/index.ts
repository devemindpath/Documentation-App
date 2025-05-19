// Message types for OpenAI API
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | MessageContent[];
}

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

// Request types for our API
export interface ChatRequest {
  message: string;
  images?: string[];
  history?: Message[];
}

// Response types
export interface UploadResponse {
  success: boolean;
  urls: string[];
  error?: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}