import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChatInterface } from "@/components/discover/ChatInterface";
import { AIChatInput } from "@/components/discover/AIChatInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import { useGlobalChat } from "@/hooks/useGlobalChat";

export default function Chat() {
  const navigate = useNavigate();
  const { messages, loading, sendMessage } = useGlobalChat();

  return (
    <>
      <Helmet>
        <title>Chat AI - Live Moment</title>
        <meta name="description" content="Chatta con l'AI per scoprire il tuo prossimo momento perfetto." />
      </Helmet>

      <div className="flex flex-col h-full">
        {/* Header with back button */}
        <ChatHeader
          title="Chat AI"
          subtitle="Assistente AI di LiveMoment"
          onBack={() => navigate(-1)}
          onShowParticipants={() => {}}
          onShowSettings={() => {}}
          avatar={
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">AI</span>
            </div>
          }
        />

        {/* Chat content - with bottom padding for fixed input */}
        <div className="flex-1 pb-20">
          <ChatInterface messages={messages} loading={loading} />
        </div>

        {/* AI Chat Input */}
        <AIChatInput 
          onSendMessage={sendMessage}
          disabled={loading}
        />
      </div>
    </>
  );
}