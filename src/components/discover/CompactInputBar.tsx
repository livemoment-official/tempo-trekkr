import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CompactInputBarProps {
  onSendMessage: (message: string) => void;
  loading?: boolean;
}

export function CompactInputBar({ onSendMessage, loading }: CompactInputBarProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative group">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Continua la conversazione..."
              disabled={loading}
              className="h-12 pl-12 pr-16 bg-card/80 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 shadow-sm transition-all duration-300 group-hover:shadow-brand/10 rounded-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              {loading ? 'AI...' : 'Invia'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}