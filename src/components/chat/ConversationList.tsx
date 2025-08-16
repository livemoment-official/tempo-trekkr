import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

export function ConversationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, isLoading, loadConversations } = useChat();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('it-IT', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/conversation/${conversationId}`);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Accedi per chattare</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Accedi per vedere le tue conversazioni e iniziare a chattare con altri utenti.
        </p>
        <AuthGuard>
          <Button>Accedi</Button>
        </AuthGuard>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
              <div className="h-3 w-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nessuna conversazione</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Non hai ancora iniziato nessuna conversazione. Trova qualcuno con cui chattare!
        </p>
        <Button onClick={() => navigate('/inviti')} className="gap-2">
          <Plus className="h-4 w-4" />
          Trova persone
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card 
          key={conversation.id} 
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => handleConversationClick(conversation.id)}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.other_participant?.avatar_url} />
                <AvatarFallback>
                  {conversation.other_participant?.name?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {conversation.unread_count && conversation.unread_count > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {conversation.unread_count}
                </Badge>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm truncate">
                  {conversation.other_participant?.name || 'Utente'}
                </h3>
                {conversation.last_message && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(conversation.last_message.created_at)}
                  </span>
                )}
              </div>
              {conversation.last_message && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {conversation.last_message.content}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}