import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Users, MessageCircle, Send, Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCityGroups } from "@/hooks/useCityGroups";
import { useGroupChat } from "@/hooks/useGroupChat";

export default function CityChat() {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { cityGroups, loadCityGroup, joinCityGroup, leaveCityGroup } = useCityGroups();
  
  const [isJoining, setIsJoining] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  
  const cityDisplayName = cityName ? 
    cityName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 
    '';

  const cityGroup = cityGroups.get(cityDisplayName);
  
  // Use group chat hook only if user is a member
  const { messages, isLoading: isChatLoading, sendMessage, isSending } = useGroupChat(
    'city',
    cityGroup?.id || null
  );

  useEffect(() => {
    if (cityDisplayName) {
      loadCityGroup(cityDisplayName);
    }
  }, [cityDisplayName]);

  const handleJoinCityGroup = async () => {
    if (!user || !cityDisplayName) return;
    
    setIsJoining(true);
    
    try {
      const success = await joinCityGroup(cityDisplayName);
      if (success) {
        toast({
          title: "Iscrizione completata",
          description: `Benvenuto nel gruppo di ${cityDisplayName}!`,
        });
      } else {
        toast({
          title: "Errore",
          description: "Non è stato possibile unirsi al gruppo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    await sendMessage(messageInput);
    setMessageInput("");
  };

  const isMember = cityGroup?.is_member || false;
  const participantCount = cityGroup?.participant_count || 0;

  return (
    <AuthGuard title="Accedi per i gruppi città" description="Devi essere autenticato per accedere ai gruppi delle città">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <ChatHeader
          title={`Gruppo ${cityDisplayName}`}
          onBack={() => navigate('/gruppi')}
          onShowParticipants={() => {}}
          onShowSettings={() => {}}
          chatType="city"
          subtitle={`Provincia di ${cityDisplayName}`}
          avatar={
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          }
        />

        {!isMember ? (
          <div className="p-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                
                <h2 className="text-xl font-bold mb-2">
                  Gruppo {cityDisplayName}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  Connettiti con persone della tua provincia. Scopri eventi, momenti e opportunità nella tua zona.
                </p>

                <div className="flex items-center justify-center gap-6 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{participantCount} partecipanti</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat di gruppo</span>
                  </div>
                </div>

                <Button 
                  className="rounded-xl" 
                  size="lg" 
                  onClick={handleJoinCityGroup}
                  disabled={isJoining}
                >
                  {isJoining ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Unendosi...</> : `Unisciti al gruppo ${cityDisplayName}`}
                </Button>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Cosa puoi fare:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left">
                    <li>• Trovare persone della tua zona</li>
                    <li>• Organizzare eventi locali</li>
                    <li>• Condividere momenti della tua città</li>
                    <li>• Ricevere aggiornamenti su eventi</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isChatLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Nessun messaggio ancora. Inizia la conversazione!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={message.sender_info?.avatar_url} />
                        <AvatarFallback>
                          {message.sender_info?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        {!isOwn && (
                          <span className="text-xs text-muted-foreground mb-1">
                            {message.sender_info?.name}
                          </span>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="border-t bg-background p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Scrivi un messaggio..."
                  className="flex-1 rounded-full"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0"
                  disabled={!messageInput.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}