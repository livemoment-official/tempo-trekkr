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
import { useGroupChat } from "@/hooks/useGroupChat";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMediaPicker } from "@/components/chat/ChatMediaPicker";
import { PollMessage } from "@/components/chat/PollMessage";
import { MediaMessage } from "@/components/chat/MediaMessage";
import { VoiceRecorder } from "@/components/chat/VoiceRecorder";
import { useChatMedia } from "@/hooks/useChatMedia";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";
import { supabase } from "@/integrations/supabase/client";

export default function ChatFullscreen() {
  const { type, id } = useParams(); // type: 'moment', 'event', 'city', 'conversation', 'friend'
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { uploadMediaFile, uploadAudioBlob, createPoll } = useChatMedia();
  
  const [message, setMessage] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [targetUserAvailability, setTargetUserAvailability] = useState<any>(null);
  
  // Handle different chat types
  const isGroupChat = type === 'moment' || type === 'event' || type === 'city';
  const isConversation = type === 'conversation';
  const isFriendChat = type === 'friend';
  
  // Group chat hook
  const groupChatType = (type === 'moment' || type === 'event' || type === 'city') ? type : 'moment';
  const {
    messages: groupMessages,
    groupInfo,
    isLoading: groupLoading,
    isSending: groupSending,
    sendMessage: sendGroupMessage
  } = useGroupChat(groupChatType, isGroupChat ? (id || '') : '');
  
  // Private conversation hook  
  const {
    messages: conversationMessages,
    conversations,
    isLoading: conversationLoading,
    isSending: conversationSending,
    loadMessages,
    sendMessage: sendConversationMessage,
    createOrGetConversation
  } = useChat(isConversation || isFriendChat ? (currentConversation?.id || id) : undefined);

  // Determine which data to use
  const messages = isGroupChat ? groupMessages : conversationMessages;
  const isLoading = isGroupChat ? groupLoading : conversationLoading;
  const isSending = isGroupChat ? groupSending : conversationSending;
  
  // Get conversation info for private chats
  const conversation = conversations.find(conv => conv.id === (currentConversation?.id || id));
  const chatInfo = isGroupChat 
    ? groupInfo 
    : isFriendChat && targetUser
      ? {
          id: targetUser.id,
          title: targetUser.name || 'Utente',
          subtitle: targetUserAvailability?.is_on && targetUserAvailability?.shareable ? 'Disponibile' : 'Online',
          type: 'friend' as const,
          avatar: targetUser.avatar_url
        }
      : conversation 
        ? {
            id: conversation.id,
            title: conversation.other_participant?.name || 'Conversazione',
            subtitle: 'Chat privata',
            type: 'conversation' as const,
            avatar: conversation.other_participant?.avatar_url
          }
        : null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load target user info and create/get conversation for friend chat
  useEffect(() => {
    if (isFriendChat && id && user) {
      const loadFriendChat = async () => {
        try {
          // Get target user info
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', id)
            .single();

          if (userError) throw userError;
          setTargetUser(userData);

          // Get target user availability
          const { data: availabilityData } = await supabase
            .from('availability')
            .select('*')
            .eq('user_id', id)
            .maybeSingle();
            
          setTargetUserAvailability(availabilityData);

          // Create or get conversation
          const conversation = await createOrGetConversation(id);
          if (conversation) {
            setCurrentConversation(conversation);
            loadMessages(conversation.id);
          }
        } catch (error) {
          console.error('Error loading friend chat:', error);
          toast({
            title: "Errore",
            description: "Errore nel caricamento della chat",
            variant: "destructive"
          });
        }
      };

      loadFriendChat();
    } else if (isConversation && id) {
      loadMessages(id);
    }
  }, [isFriendChat, isConversation, id, user, createOrGetConversation, loadMessages]);

  // Handle sending enhanced message
  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    
    try {
      if (isGroupChat) {
        await sendGroupMessage(message);
      } else if ((isConversation && id) || (isFriendChat && currentConversation)) {
        const convId = isFriendChat ? currentConversation?.id : id;
        if (convId) {
          await sendConversationMessage(message, convId);
        }
      }
      setMessage("");
    } catch (error) {
      // Error is handled in the hooks
    }
  };

  // Handle enhanced message sending (media, polls, audio)
  const handleSendEnhancedMessage = async (content: string, type?: 'text' | 'image' | 'video' | 'audio' | 'poll', data?: any) => {
    if (isSending) return;
    
    try {
      if (type === 'text' || !type) {
        // Regular text message
        if (isGroupChat) {
          await sendGroupMessage(content);
        } else if ((isConversation && id) || (isFriendChat && currentConversation)) {
          const convId = isFriendChat ? currentConversation?.id : id;
          if (convId) {
            await sendConversationMessage(content, convId);
          }
        }
      } else {
        // Enhanced message types
        let messageContent = content;
        
        if (type === 'poll' && data) {
          const pollId = await createPoll(data.question, data.options);
          if (pollId) {
            messageContent = `Sondaggio: ${data.question}`;
            // For now, send as text. Later we'll extend the hooks to handle poll_id
            if (isGroupChat) {
              await sendGroupMessage(messageContent);
            } else if ((isConversation && id) || (isFriendChat && currentConversation)) {
              const convId = isFriendChat ? currentConversation?.id : id;
              if (convId) {
                await sendConversationMessage(messageContent, convId);
              }
            }
          }
        } else if ((type === 'image' || type === 'video' || type === 'audio') && data?.file) {
          const uploadResult = await uploadMediaFile(data.file, type);
          if (uploadResult) {
            messageContent = `${type === 'image' ? 'Immagine' : type === 'video' ? 'Video' : 'Audio'}: ${uploadResult.fileName}`;
            // For now, send as text. Later we'll extend the hooks to handle file URLs
            if (isGroupChat) {
              await sendGroupMessage(messageContent);
            } else if ((isConversation && id) || (isFriendChat && currentConversation)) {
              const convId = isFriendChat ? currentConversation?.id : id;
              if (convId) {
                await sendConversationMessage(messageContent, convId);
              }
            }
          }
        } else if (type === 'audio' && data?.audioBlob) {
          const uploadResult = await uploadAudioBlob(data.audioBlob, data.duration);
          if (uploadResult) {
            messageContent = uploadResult.fileName;
            // For now, send as text. Later we'll extend the hooks to handle file URLs
            if (isGroupChat) {
              await sendGroupMessage(messageContent);
            } else if ((isConversation && id) || (isFriendChat && currentConversation)) {
              const convId = isFriendChat ? currentConversation?.id : id;
              if (convId) {
                await sendConversationMessage(messageContent, convId);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending enhanced message:', error);
    }
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
        <title>Chat · {chatInfo?.title || "LiveMoment"}</title>
        <meta name="description" content={`Chat ${isFriendChat ? 'privata' : 'di gruppo'} per ${chatInfo?.title || "LiveMoment"}`} />
      </Helmet>

      {/* Chat Header */}
      {chatInfo && (
        <ChatHeader
          title={chatInfo.title}
          subtitle={chatInfo.subtitle}
          avatar={
            <Avatar className="h-9 w-9">
              <AvatarImage src={(chatInfo as any).avatar || (conversation?.other_participant?.avatar_url)} />
              <AvatarFallback>
                {chatInfo.title?.slice(0, 2).toUpperCase() || 'CH'}
              </AvatarFallback>
            </Avatar>
          }
          chatType={isFriendChat ? 'friend' : isConversation ? 'conversation' : chatInfo.type === 'event' ? 'moment' : chatInfo.type}
          onBack={() => navigate(-1)}
          onShowParticipants={() => {}}
          onShowSettings={() => {}}
          showCreateMoment={chatInfo.type === 'moment'}
          onCreateMoment={chatInfo.type === 'moment' ? handleShare : undefined}
          eventDate={groupInfo?.date}
          eventTime={groupInfo?.time}
          location={groupInfo?.location}
          participantCount={groupInfo?.memberCount}
        />
      )}

      {/* Info Banner per momenti */}
      {(groupInfo?.type === 'moment' || groupInfo?.type === 'event') && (
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center gap-4 text-sm">
            {groupInfo.date && groupInfo.time && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{groupInfo.date} • {groupInfo.time}</span>
              </div>
            )}
            {groupInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{groupInfo.location}</span>
              </div>
            )}
            {groupInfo.memberCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{groupInfo.memberCount} membri</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.sender?.avatar_url} />
                  <AvatarFallback>
                    {msg.sender?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`space-y-1 ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{msg.sender?.name || 'Utente'}</span>
                    <span>{formatTime(msg.created_at)}</span>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input with Enhanced Features */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2 items-end">
          <ChatMediaPicker 
            onSendMessage={handleSendEnhancedMessage}
            disabled={isSending}
          />
          
          <VoiceRecorder 
            onSendRecording={async (audioBlob, duration) => {
              await handleSendEnhancedMessage('', 'audio', { audioBlob, duration });
            }}
            disabled={isSending}
          />
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            aria-label="Invia messaggio"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}