# GPT Chat Backend with SSE, Image Upload via Supabase

This is a backend service built with Express.js and TypeScript that allows the frontend to send chat messages with optional images. The backend stores images in Supabase Storage, then sends the image URLs along with the message to OpenAI's GPT-4 Vision API. Responses stream back to the frontend using Server-Sent Events (SSE).

## Features

- **SSE Chat Endpoint**: Stream responses from OpenAI GPT-4 Vision API
- **Image Upload Endpoint**: Upload images to Supabase Storage
- **Supabase Integration**: Store and retrieve images from Supabase Storage
- **OpenAI GPT-4 Vision API**: Process text and images for AI responses

## Prerequisites

- Node.js (v14 or higher)
- Supabase account with Storage bucket set up
- OpenAI API key with access to GPT-4 Vision API

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_BUCKET=your_supabase_bucket_name
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   ```
   
   For development:
   ```bash
   npm run dev
   ```

## API Endpoints

### Upload Images

```
POST /api/upload
```

- **Request**: `multipart/form-data` with field name `images` (up to 5 images)
- **Response**: JSON with uploaded image URLs
  ```json
  {
    "success": true,
    "urls": ["https://..."]
  }
  ```

### Chat with GPT-4 Vision

```
GET /api/chat
```

- **Query Parameters**:
  - `message` (required): User's text message
  - `images` (optional): JSON stringified array of image URLs
  - `history` (optional): JSON stringified array of past messages
- **Response**: Server-Sent Events stream with AI responses

## Example Usage

### Uploading Images

```javascript
const formData = new FormData();
formData.append('images', imageFile1);
formData.append('images', imageFile2);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { urls } = await response.json();
```

### Chatting with Images

```javascript
const message = "What's in these images?";
const images = ["https://...url1...", "https://...url2..."];
const history = [
  { role: "user", content: "Previous message" },
  { role: "assistant", content: "Previous response" }
];

const queryParams = new URLSearchParams({
  message,
  images: JSON.stringify(images),
  history: JSON.stringify(history)
});

const eventSource = new EventSource(`/api/chat?${queryParams}`);

eventSource.onmessage = (event) => {
  if (event.data === "[DONE]") {
    eventSource.close();
    return;
  }
  
  const { content } = JSON.parse(event.data);
  console.log(content); // Process the streamed response
};

eventSource.onerror = (error) => {
  console.error("SSE Error:", error);
  eventSource.close();
};
```