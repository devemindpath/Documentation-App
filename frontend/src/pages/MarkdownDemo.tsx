import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MarkdownPreview from '../components/MarkdownPreview';
import '../styles/markdownDemo.css';

const MarkdownDemo: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(`# Markdown Preview Demo

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
`);

  return (
    <div className="markdown-demo-container">
      <div className="header">
        <Link to="/dashboard" className="back-link">
          <svg 
            className="back-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>
        <h1>Markdown Preview Demo</h1>
      </div>

      <div className="content-container">
        <div className="editor-pane">
          <h2>Markdown Editor</h2>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="markdown-editor"
            placeholder="Enter markdown here..."
          />
        </div>
        
        <div className="preview-pane">
          <h2>Preview</h2>
          <div className="preview-container">
            <MarkdownPreview markdown={markdown} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownDemo;