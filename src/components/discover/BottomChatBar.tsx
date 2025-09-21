import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Users, MapPin, Music, Calendar } from 'lucide-react';
import { useDynamicSuggestions } from '@/hooks/useDynamicSuggestions';

interface BottomChatBarProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const BottomChatBar: React.FC<BottomChatBarProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [input, setInput] = useState('');
  const { availableUsers, eventsCount, artistsCount } = useDynamicSuggestions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  const quickSuggestions = [
    {
      icon: Users,
      text: "Persone ora",
      prompt: "Mi suggerisci persone nuove interessanti con cui potrei uscire oggi nella mia zona?"
    },
    {
      icon: Calendar,
      text: "Eventi oggi",
      prompt: "Cerco locali o eventi interessanti nella mia zona a cui partecipare"
    },
    {
      icon: MapPin,
      text: "Luoghi fighi",
      prompt: "Dove posso andare per fare nuove esperienze interessanti?"
    },
    {
      icon: Music,
      text: "Artisti",
      prompt: "Vorrei trovare artisti forti da scoprire o invitare per fare un evento insieme"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border z-50">
      <div className="container max-w-4xl mx-auto px-4 py-4 space-y-3">
        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 justify-center">
          {quickSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSendMessage(suggestion.prompt)}
                className="h-8 px-3 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-xs"
                disabled={disabled}
              >
                <Icon className="h-3 w-3 mr-1.5 text-primary" />
                {suggestion.text}
              </Button>
            );
          })}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cosa stai cercando oggi?"
            disabled={disabled}
            className="flex-1 h-12 rounded-full bg-muted/50 border-border/50 focus:border-primary/50 px-4"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={disabled || !input.trim()}
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};