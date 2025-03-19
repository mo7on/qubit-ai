import React from 'react';
import Image from 'next/image';

// ... existing code ...

interface MessageProps {
  message: {
    content: string;
    role: string;
  };
  isUser?: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isUser = false }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="mr-2 flex-shrink-0">
          {/* Replace the robot icon with the Qub-IT logo */}
          <Image 
            src="/qubit-ai.svg" 
            alt="Qub-IT Logo" 
            width={32} 
            height={32} 
            className="rounded-full"
          />
        </div>
      )}
      <div className={`p-3 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
        {message.content}
      </div>
      {/* ... existing code ... */}
    </div>
  );
};

// ... existing code ...

export default Message;