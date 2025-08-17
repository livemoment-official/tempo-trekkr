import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Bot, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response for now - in real app, connect to OpenAI API
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Ciao! Sono l'assistente AI di LiveMoment. Come posso aiutarti a trovare il momento perfetto per te?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · Chat AI</title>
        <meta name="description" content="Chatta con l'assistente AI di LiveMoment per trovare momenti e eventi perfetti per te" />
      </Helmet>

      {/* Header - Only visible when collapsed */}
      {!isExpanded && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 h-14 flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="font-semibold">Assistente AI</h1>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-primary"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </header>
      )}

      {/* Chat Container */}
      <div className={`${isExpanded ? 'fixed inset-0 z-50 bg-background' : 'container mx-auto px-4 pb-24'}`}>
        {/* Expanded Header */}
        {isExpanded && (
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
            <div className="px-4 h-14 flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="font-semibold">Assistente AI LiveMoment</h1>
                  <p className="text-xs text-muted-foreground">Powered by OpenAI</p>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Messages */}
        <div className={`${isExpanded ? 'h-[calc(100vh-120px)] overflow-y-auto' : 'min-h-[60vh]'} py-4 space-y-4`}>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Assistente AI LiveMoment</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ciao! Sono qui per aiutarti a trovare i momenti perfetti. 
                Dimmi cosa ti piacerebbe fare e ti consiglierò eventi e attività nella tua zona.
              </p>
              
              <div className="mt-6 grid gap-2 max-w-sm mx-auto">
                <Button
                  variant="outline"
                  className="text-left justify-start"
                  onClick={() => setInputMessage("Cosa potrei fare questo weekend a Milano?")}
                >
                  "Cosa potrei fare questo weekend a Milano?"
                </Button>
                <Button
                  variant="outline"
                  className="text-left justify-start"
                  onClick={() => setInputMessage("Trova aperitivi stasera")}
                >
                  "Trova aperitivi stasera"
                </Button>
                <Button
                  variant="outline"
                  className="text-left justify-start"
                  onClick={() => setInputMessage("Eventi di sport questo fine settimana")}
                >
                  "Eventi di sport questo fine settimana"
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mt-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-12' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('it-IT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 mt-2">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 mt-2">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`${isExpanded ? 'absolute bottom-0 left-0 right-0' : 'fixed bottom-20'} bg-background border-t p-4`}>
          <div className={`${isExpanded ? '' : 'container mx-auto'} flex gap-2`}>
            <Input
              placeholder="Scrivi un messaggio..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}