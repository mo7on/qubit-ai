import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { CommandBlock } from './CommandBlock';

interface MarkdownRendererProps {
  content: string;
}

type CodeComponentProps = React.ComponentPropsWithoutRef<'code'> & { node?: any; inline?: boolean };

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code: ({ node, inline, className, children, ...props }: CodeComponentProps) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : undefined;
          
          if (!inline && language && ['bash', 'sh', 'shell', 'cmd'].includes(language)) {
            return <CommandBlock command={String(children).replace(/\n$/, '')} />;
          }
          
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}