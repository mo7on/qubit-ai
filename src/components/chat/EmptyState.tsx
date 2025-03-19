import React from 'react';
import Image from 'next/image';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-4">
        <Image 
          src="/qubit-ai.svg" 
          alt="Qub-IT Logo" 
          width={80} 
          height={80} 
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
      <p className="text-gray-500 text-center max-w-md">
        Ask a question or start a new conversation to get assistance.
      </p>
    </div>
  );
};

export default EmptyState;