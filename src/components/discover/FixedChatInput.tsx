import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useGlobalChat } from '@/hooks/useGlobalChat';

export const FixedChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { sendMessage, loading } = useGlobalChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const message = input.trim();
    setInput('');
    
    // Navigate to chat page if not already there
    if (location.pathname === '/esplora') {
      navigate('/esplora/chat');
    }
    
    // Send the message after a small delay to ensure navigation completes
    setTimeout(() => {
      sendMessage(message);
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Navigate to chat when user starts typing
    if (value.length === 1 && location.pathname === '/esplora') {
      navigate('/esplora/chat');
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-screen-sm z-30 px-4">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border border-border/50 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2 p-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Cosa stai cercando oggi?"
            disabled={loading}
            className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={loading || !input.trim()}
            className="h-9 w-9 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};