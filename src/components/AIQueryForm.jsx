"use client";

import { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

export function AIQueryForm() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">AI Research Assistant</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="query" className="block text-sm font-medium mb-2">
            Ask a question
          </label>
          <textarea
            id="query"
            rows={3}
            className="w-full p-3 border rounded-md bg-gray-800 text-white"
            placeholder="Enter your question here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Get Answer'}
        </button>
      </form>
      
      {error && (
        <div className="p-4 mb-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Answer</h3>
            <div className="p-4 bg-gray-800 rounded-md">
              <MarkdownRenderer content={result.response} />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Sources</h3>
            <div className="space-y-3">
              {result.sources.map((source, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-md">
                  <h4 className="font-medium">
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {source.title || 'Source ' + (index + 1)}
                    </a>
                  </h4>
                  <p className="text-sm text-gray-400 truncate">{source.url}</p>
                  <p className="mt-1 text-sm">{source.content.substring(0, 150)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}