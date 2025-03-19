import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CommandBlockProps {
  command: string;
}

export function CommandBlock({ command }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative my-4 rounded-md bg-zinc-900 text-white overflow-hidden">
      <div className="flex items-center px-4 py-2 bg-zinc-900 text-sm font-mono">
        <span>Terminal</span>
        <div className="flex-grow"></div>
        <button
          onClick={copyToClipboard}
          className="p-1 hover:bg-slate-800 rounded"
          aria-label="Copy to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-sm">
        <code>{command}</code>
      </pre>
    </div>
  );
}