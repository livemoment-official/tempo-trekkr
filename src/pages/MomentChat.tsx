import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShareModal } from "@/components/shared/ShareModal";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInfoBanner } from "@/components/chat/ChatInfoBanner";
import { ChatSettingsModal } from "@/components/chat/ChatSettingsModal";
import { ParticipantsList } from "@/components/chat/ParticipantsList";
import { supabase } from "@/integrations/supabase/client";

interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    name: string;
    avatar_url?: string;
  };
}

interface MomentInfo {
  id: string;
  title: string;
  description?: string;
  host_id: string;
  participants: string[];
  when_at?: string;
  place?: any;
  photos?: string[];
  host?: {
    name: string;
    avatar_url?: string;
  };
}

export default function MomentChat() {
  const { id: momentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [moment, setMoment] = useState<MomentInfo | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!momentId || !user) return;

    loadMoment();
    loadMessages();

    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel(`group_messages_${momentId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${momentId}` },
        (payload) => {
          loadMessages(); // Reload to get sender info
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [momentId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMoment = async () => {
    if (!momentId) return;

    try {
      const { data, error } = await supabase
        .from('moments')
        .select(`
          *,
          host:profiles!moments_host_id_fkey(name, avatar_url)
        `)
        .eq('id', momentId)
        .maybeSingle();

      if (error) throw error;

      setMoment({
        ...data,
        host: Array.isArray(data.host) ? data.host[0] : data.host
      });
    } catch (error) {
      console.error('Error loading moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile caricare il momento.",
        variant: "destructive",
      });
      navigate('/momenti');
    }
  };

  const loadMessages = async () => {
    if (!momentId) return;

    try {
      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', momentId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Then get sender profiles for each message
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', senderIds);

      if (profilesError) throw profilesError;

      // Combine messages with sender info
      const messagesWithSenders = messagesData?.map(message => ({
        ...message,
        sender: profilesData?.find(p => p.id === message.sender_id)
      })) || [];

      setMessages(messagesWithSenders);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !momentId || isSending) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: momentId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile inviare il messaggio.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserInMoment = moment && (moment.host_id === user?.id || moment.participants.includes(user?.id || ''));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!moment || !isUserInMoment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-xl font-bold mb-2">Momento non trovato</h1>
        <p className="text-muted-foreground mb-4">Non hai accesso a questo momento.</p>
        <Button onClick={() => navigate('/momenti')}>
          Torna ai Momenti
        </Button>
      </div>
    );
  }

  return (
    <AuthGuard title="Accedi per chattare" description="Devi essere autenticato per partecipare alla chat del momento">
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <ChatHeader
          title={moment.title}
          onBack={() => navigate(`/moment/${momentId}`)}
          onShowParticipants={() => setShowParticipants(true)}
          onShowSettings={() => setShowSettings(true)}
          chatType="moment"
          eventDate={moment.when_at ? new Date(moment.when_at).toLocaleDateString('it-IT') : undefined}
          eventTime={moment.when_at ? new Date(moment.when_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : undefined}
          location={moment.place?.name}
          participantCount={moment.participants.length}
          avatar={
            moment.photos?.[0] && (
              <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                <img 
                  src={moment.photos[0]} 
                  alt={moment.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          }
        />

        {/* Info Banner */}
        <ChatInfoBanner
          type="moment"
          contentId={momentId || ''}
          contentTitle={moment.title}
          location={moment.place ? { name: moment.place.name } : undefined}
          when={moment.when_at}
          participantCount={moment.participants.length}
          onShowParticipants={() => setShowParticipants(true)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nessun messaggio ancora.</p>
              <p className="text-sm text-muted-foreground">Inizia la conversazione!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.sender_id === user?.id;
              const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
              const isHost = message.sender_id === moment.host_id;
              
              return (
                <div key={message.id} className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  {!isOwnMessage && (
                    <div className="w-8 h-8">
                      {showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {message.sender?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-xs ${isOwnMessage ? 'ml-auto' : ''}`}>
                    {!isOwnMessage && showAvatar && (
                      <div className="flex items-center gap-2 mb-1 ml-2">
                        <p className="text-xs text-muted-foreground">
                          {message.sender?.name || 'Utente'}
                        </p>
                        {isHost && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                            Host
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className={`p-3 rounded-2xl ${
                      isOwnMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="flex-1 rounded-full"
            />
            <Button type="submit" size="sm" className="rounded-full" disabled={isSending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Modals */}
        <ChatSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          chatTitle={moment.title}
          chatType="moment"
        />

        <ParticipantsList
          isOpen={showParticipants}
          onClose={() => setShowParticipants(false)}
          participantIds={moment.participants}
          hostId={moment.host_id}
          title={moment.title}
          type="moment"
        />
      </div>
    </AuthGuard>
  );
}