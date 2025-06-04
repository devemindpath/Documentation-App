import { Request, Response } from 'express';
// import openai from '../config/openai';
import { ChatRequest, Message, MessageContent } from '../types';
const demoData = `# Markdown Preview Demo

This is a demonstration of the Markdown Preview component.

## Features

- **GitHub Flavored Markdown** support
- Responsive design
- Syntax highlighting for code blocks
- Table support
- And more!

## Code Example

\`\`\`javascript
// This is a code block
function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));
\`\`\`

## Table Example

| Name | Type | Description |
|------|------|-------------|
| id | string | Unique identifier |
| title | string | The title of the document |
| content | string | The markdown content |
| createdAt | Date | Creation timestamp |

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item 1
  - Nested item 2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Blockquote

> This is a blockquote.
> It can span multiple lines.

## Links and Images

[Visit GitHub](https://github.com)

![Sample Image](https://via.placeholder.com/600x300)

## Task List

- [x] Create Markdown component
- [x] Style the component
- [ ] Add more features

## Horizontal Rule

---

## Emphasis

*This text is italicized*

**This text is bold**

~~This text is strikethrough~~

## Inline Code

Use the \`console.log()\` function to log messages to the console.
`

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

    // Set up SSE headers with CORS support
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
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
    // const stream = await openai.chat.completions.create({
    //   model: 'gpt-4-vision-preview',
    //   messages: messages as any, // Type casting due to OpenAI SDK typing differences
    //   stream: true,
    //   max_tokens: 2000,
    // });

    // Stream the response to the client
    // for await (const chunk of stream) {
    //   const content = chunk.choices[0]?.delta?.content || '';
    //   if (content) {
    //     res.write(`data: ${JSON.stringify({ content })}\n\n`);
    //   }
    // }

    // For now, simulate a response since OpenAI is commented out
    // Send a mock response
    const mockResponse = demoData;
    
    // Simulate streaming by sending the response in chunks
    const words = mockResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
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