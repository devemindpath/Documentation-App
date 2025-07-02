import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/markdownPreview.css';

interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown, className = '' }) => {
  return (
    <div className={`markdown-preview ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading rendering
          h1: ({ node, ...props }) => <h1 className="text-2xl md:text-3xl font-bold my-4 text-left" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl md:text-2xl font-bold my-3 text-left" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg md:text-xl font-semibold my-2 text-left" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base md:text-lg font-semibold my-2 text-left" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-sm md:text-base font-semibold my-1 text-left" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-xs md:text-sm font-semibold my-1 text-left" {...props} />,
          
          // Customize paragraph rendering
          p: ({ node, ...props }) => <p className="my-2 text-left" {...props} />,
          
          // Customize list rendering
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 text-left" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 text-left" {...props} />,
          li: ({ node, ...props }) => <li className="my-1 text-left" {...props} />,
          
          // Customize code block rendering
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="code-block-wrapper my-4">
                <div className="code-language-tag">{match[1]}</div>
                <pre className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          
          // Customize blockquote rendering
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-left" {...props} />
          ),
          
          // Customize table rendering
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 text-left">
              <table className="min-w-full border-collapse text-left" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-700 text-left" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-left" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 text-left" {...props} />,
          th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-semibold" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-2 text-left" {...props} />,
          
          // Customize link rendering
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 dark:text-blue-400 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          
          // Customize image rendering
          img: ({ node, ...props }) => (
            <img 
              className="max-w-full h-auto my-4 rounded-md" 
              loading="lazy" 
              {...props} 
            />
          ),
          
          // Customize horizontal rule
          hr: ({ node, ...props }) => <hr className="my-6 border-t border-gray-300 dark:border-gray-600 text-left" {...props} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;