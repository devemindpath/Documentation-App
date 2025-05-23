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

// User types
export interface User {
  id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRequest {
  user: User;
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

export interface UserResponse {
  success: boolean;
  message?: string;
  user?: User;
  error?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  database?: string;
  version?: string;
  environment?: string;
  error?: string;
}