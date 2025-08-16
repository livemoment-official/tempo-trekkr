import React, { useState } from 'react';
import { Search, Sparkles, Users, MapPin, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
interface AIHeroSectionProps {
  onSendMessage: (message: string) => void;
  loading?: boolean;
}
export function AIHeroSection({
  onSendMessage,
  loading
}: AIHeroSectionProps) {
  const [input, setInput] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  const quickSuggestions = [{
    icon: Users,
    text: "Persone nuove con cui uscire oggi",
    prompt: "Mi suggerisci persone nuove interessanti con cui potrei uscire oggi nella mia zona?"
  }, {
    icon: MapPin,
    text: "Locali ed eventi nella mia zona",
    prompt: "Cerco locali o eventi interessanti nella mia zona a cui partecipare"
  }, {
    icon: Music,
    text: "Artisti da scoprire",
    prompt: "Vorrei trovare artisti forti da scoprire o invitare per fare un evento insieme"
  }];
  return <div className="relative flex flex-col items-center justify-center min-h-[85vh] px-4">
      {/* Futuristic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/50 to-background pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight md:text-2xl text-2xl">
            Cosa vorresti vivere?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed md:text-sm text-sm">Trova persone affini a te, esperienze e location uniche ogni volta che vuoi.</p>
        </div>

        {/* AI Chat Bar */}
        <form onSubmit={handleSubmit} className="relative group">
          <div className="relative">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Cosa potrei fare questo weekend a Milano?" disabled={loading} className="h-14 pl-12 pr-20 text-lg bg-card/80 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 shadow-elevated transition-all duration-300 group-hover:shadow-brand/20 rounded-md" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Button type="submit" size="sm" disabled={!input.trim() || loading} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-brand">
              <Sparkles className="h-4 w-4 mr-1" />
              {loading ? 'AI...' : 'Chiedi'}
            </Button>
          </div>
          
          {/* Futuristic glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
        </form>

        {/* Quick Suggestions */}
        <div className="space-y-3">
          <div className="flex flex-wrap justify-center gap-3">
            {quickSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return <Button key={index} variant="outline" onClick={() => onSendMessage(suggestion.prompt)} className="h-auto py-3 px-4 rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group/suggestion" disabled={loading}>
                  <Icon className="h-4 w-4 mr-2 text-primary group-hover/suggestion:text-primary transition-colors" />
                  <span className="text-sm font-medium">{suggestion.text}</span>
                </Button>;
          })}
          </div>
        </div>
      </div>
    </div>;
}