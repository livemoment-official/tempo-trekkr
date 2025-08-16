import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Share2, 
  MoreVertical,
  MapPin,
  Calendar,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ChatFullscreen() {
  const { type, id } = useParams(); // type: 'moment', 'city', 'friend'
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - sostituire con chiamate API reali
  useEffect(() => {
    const loadChatData = async () => {
      setIsLoading(true);
      
      // Simulazione caricamento dati basato sul tipo
      let mockChatInfo;
      let mockMessages;

      switch (type) {
        case 'moment':
          mockChatInfo = {
            title: "Aperitivo sui Navigli",
            subtitle: "12 membri • Oggi alle 18:30",
            type: "moment",
            location: "Navigli, Milano",
            date: "Oggi",
            time: "18:30",
            memberCount: 12
          };
          mockMessages = [
            {
              id: '1',
              user_id: 'user1',
              user_name: 'Marco R.',
              content: 'Chi porta la chitarra stasera? 🎸',
              created_at: new Date(Date.now() - 120000).toISOString(),
              isOrganizer: true
            },
            {
              id: '2',
              user_id: 'user2', 
              user_name: 'Sofia M.',
              content: 'Io! Non vedo l\'ora 😊',
              created_at: new Date(Date.now() - 60000).toISOString(),
              isOrganizer: false
            }
          ];
          break;
          
        case 'city':
          mockChatInfo = {
            title: "Gruppo Milano",
            subtitle: "248 membri online",
            type: "city",
            memberCount: 248
          };
          mockMessages = [
            {
              id: '3',
              user_id: 'user3',
              user_name: 'Alessandro T.',
              content: 'Qualcuno per una birra in zona Brera?',
              created_at: new Date(Date.now() - 300000).toISOString(),
              isOrganizer: false
            }
          ];
          break;
          
        case 'friend':
          mockChatInfo = {
            title: "Giulia Rossi",
            subtitle: "Online ora",
            type: "friend",
            isOnline: true
          };
          mockMessages = [
            {
              id: '4',
              user_id: 'friend1',
              user_name: 'Giulia R.',
              content: 'Ci vediamo domani al concerto?',
              created_at: new Date(Date.now() - 180000).toISOString(),
              isOrganizer: false
            }
          ];
          break;
      }

      setChatInfo(mockChatInfo);
      setMessages(mockMessages || []);
      setIsLoading(false);
    };

    loadChatData();
  }, [type, id]);

  // Auto scroll to bottom quando arrivano nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      user_id: 'current_user',
      user_name: 'Tu',
      content: message,
      created_at: new Date().toISOString(),
      isOrganizer: false
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");

    toast({
      title: "Messaggio inviato",
      description: "Il tuo messaggio è stato inviato al gruppo"
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share && chatInfo?.type === 'moment') {
        await navigator.share({
          title: `${chatInfo.title} - LiveMoment`,
          text: 'Unisciti a noi per questo momento!',
          url: `${window.location.origin}/moment/${id}`
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiato!",
          description: "Il link è stato copiato negli appunti"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Caricamento chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>LiveMoment · {chatInfo?.title}</title>
        <meta name="description" content={`Chat ${chatInfo?.title}`} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{chatInfo?.title}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {chatInfo?.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {chatInfo?.type === 'moment' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Info Banner per momenti */}
      {chatInfo?.type === 'moment' && (
        <div className="bg-primary/5 border-b p-4">
          <div className="container mx-auto flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{chatInfo.date} alle {chatInfo.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{chatInfo.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span>{chatInfo.memberCount} membri</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {msg.user_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{msg.user_name}</span>
                  {msg.isOrganizer && (
                    <Badge variant="secondary" className="text-xs">
                      Organizzatore
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-sm break-words">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t bg-background">
        <div className="container mx-auto p-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!message.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}