import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Calendar, MapPin, Music } from 'lucide-react';

interface AIResponseRendererProps {
  content: string;
}

export function AIResponseRenderer({ content }: AIResponseRendererProps) {
  const navigate = useNavigate();

  // Parse content for clickable links and actions
  const renderContent = () => {
    // Check for navigation links in the response
    const linkPatterns = [
      { pattern: /\[Inviti\]/g, route: '/inviti', icon: Users, label: 'Vai agli Inviti' },
      { pattern: /\[Eventi\]/g, route: '/momenti-eventi', icon: Calendar, label: 'Vedi Eventi' },
      { pattern: /\[Momenti\]/g, route: '/momenti-eventi', icon: MapPin, label: 'Esplora Momenti' },
      { pattern: /\[Profili\]/g, route: '/profili', icon: Music, label: 'Scopri Profili' },
      { pattern: /\[TrovaAmici\]/g, route: '/trova-amici', icon: Users, label: 'Trova Amici' }
    ];

    let processedContent = content;
    const links: Array<{ route: string; icon: any; label: string }> = [];

    linkPatterns.forEach(({ pattern, route, icon, label }) => {
      if (pattern.test(content)) {
        processedContent = processedContent.replace(pattern, '');
        links.push({ route, icon, label });
      }
    });

    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {processedContent.trim()}
        </p>
        
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
            {links.map(({ route, icon: Icon, label }, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => navigate(route)}
                className="h-8 text-xs border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return renderContent();
}