import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { CommandBlock } from './CommandBlock';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
}

type CodeComponentProps = React.ComponentPropsWithoutRef<'code'> & { node?: any; inline?: boolean };

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-5 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-primary underline hover:text-primary/80 transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          code: ({ node, inline, className, children, ...props }: CodeComponentProps) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : undefined;
            
            if (!inline && language && ['bash', 'sh', 'shell', 'cmd'].includes(language)) {
              return <CommandBlock command={String(children).replace(/\n$/, '')} />;
            }
            
            return inline ? (
              <code className={cn("px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm", className)} {...props}>
                {children}
              </code>
            ) : (
              <pre className="my-4 p-4 rounded-lg bg-muted overflow-x-auto">
                <code className={cn("text-sm font-mono", className)} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          hr: () => <hr className="my-6 border-border" />,
          img: ({ src, alt }) => (
            <img 
              src={src || ''} 
              alt={alt || ''} 
              className="my-4 rounded-lg max-w-full h-auto"
            />
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="py-2 px-3 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="py-2 px-3">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}