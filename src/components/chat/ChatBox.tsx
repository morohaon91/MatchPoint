'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile } from '@/lib/types/models';
import { sendGameChatMessage, subscribeToGameChat } from '@/lib/chat/chatService';
import { formatDate } from '@/lib/utils/dateUtils';

interface ChatBoxProps {
  gameId: string;
  userId: string;
  userProfile?: UserProfile;
  participants?: { [userId: string]: { name: string; photoURL?: string } };
}

/**
 * ChatBox component for game-specific chat
 */
export default function ChatBox({
  gameId,
  userId,
  userProfile,
  participants = {}
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Subscribe to chat messages
  useEffect(() => {
    const unsubscribe = subscribeToGameChat(gameId, (updatedMessages) => {
      setMessages(updatedMessages);
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [gameId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Get user name and photo from participants or userProfile
  const getUserInfo = (messageUserId: string) => {
    if (participants[messageUserId]) {
      return {
        name: participants[messageUserId].name || 'Unknown User',
        photoURL: participants[messageUserId].photoURL
      };
    }
    
    if (messageUserId === userId && userProfile) {
      return {
        name: userProfile.name || 'You',
        photoURL: userProfile.photoURL
      };
    }
    
    return {
      name: 'Unknown User',
      photoURL: undefined
    };
  };
  
  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendGameChatMessage(gameId, userId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error toast or message
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Game Chat</h3>
      </div>
      
      <div className="p-4">
        <div className="h-80 overflow-y-auto mb-4 p-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.userId === userId;
                const { name, photoURL } = getUserInfo(message.userId);
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-xs md:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="flex-shrink-0">
                        {photoURL ? (
                          <img 
                            src={photoURL} 
                            alt={name} 
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-medium">
                              {name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`mx-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        <div 
                          className={`px-4 py-2 rounded-lg inline-block ${
                            isCurrentUser 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">
                            {name} • {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || !newMessage.trim()}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
