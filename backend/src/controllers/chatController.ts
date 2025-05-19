import { Request, Response } from 'express';
import openai from '../config/openai';
import { ChatRequest, Message, MessageContent } from '../types';

export const streamChat = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse query parameters
    const message = req.query.message as string;
    const imagesParam = req.query.images as string;
    const historyParam = req.query.history as string;
    
    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Message is required',
      });
      return;
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Parse images and history if provided
    const images = imagesParam ? JSON.parse(imagesParam) as string[] : [];
    const history = historyParam ? JSON.parse(historyParam) as Message[] : [];

    // Prepare message content for OpenAI
    const content: MessageContent[] = [{ type: 'text', text: message }];
    
    // Add images to content if provided
    if (images && images.length > 0) {
      for (const imageUrl of images) {
        content.push({
          type: 'image_url',
          image_url: { url: imageUrl }
        });
      }
    }

    // Prepare messages array for OpenAI
    const messages: Message[] = [
      ...history,
      { role: 'user', content }
    ];

    // Create stream from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: messages as any, // Type casting due to OpenAI SDK typing differences
      stream: true,
      max_tokens: 2000,
    });

    // Stream the response to the client
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // End the stream
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    
    // If headers haven't been sent yet, send error as JSON
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during chat',
      });
      return;
    }
    
    // If headers have been sent (streaming started), send error as SSE
    res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
    res.end();
  }
};