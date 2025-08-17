import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  ThumbsUp, 
  Star, 
  Flame,
  MessageCircle,
  Send,
  UserPlus,
  Calendar,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ParticipationConfirmModal } from "@/components/ParticipationConfirmModal";

export default function MomentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isParticipating, setIsParticipating] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Mock moment data - in real app, fetch from database
  const moment = {
    id: id || '1',
    title: 'Aperitivo al tramonto sui Navigli',
    description: 'Unisciti a noi per un aperitivo rilassante mentre guardiamo il tramonto sui Navigli! Atmosfera chill, buona musica e drinks fantastici. Perfetto per conoscere nuove persone e godersi la serata milanese.',
    image: '/api/placeholder/400/600',
    category: 'aperitivo',
    time: '18:30',
    date: 'Oggi, 15 Dicembre',
    location: 'Navigli, Milano',
    detailedLocation: 'Darsena, Porta Ticinese, 20143 Milano MI',
    organizer: {
      id: 'org1',
      name: 'Marco Rossi',
      avatar: '',
      bio: 'Amante degli aperitivi e della vita notturna milanese. Organizzo eventi da 3 anni!',
      age: 28,
      verified: true
    },
    participants: 12,
    maxParticipants: 20,
    reactions: {
      hearts: 24,
      likes: 18,
      stars: 15,
      fire: 8
    },
    mood: 'Rilassato',
    tags: ['aperitivo', 'navigli', 'tramonto', 'musica', 'chill'],
    whyCome: [
      'Atmosfera unica sui Navigli',
      'Drinks di qualità a prezzi onesti', 
      'Gruppo di persone fantastiche',
      'Vista tramonto mozzafiato',
      'Musica selezionata dal vivo'
    ],
    chatMessages: [
      {
        id: '1',
        user: 'Marco R.',
        message: 'Chi porta la chitarra stasera? 🎸',
        time: '2 min fa',
        isOrganizer: true
      },
      {
        id: '2', 
        user: 'Sofia M.',
        message: 'Io! Non vedo l\'ora 😊',
        time: '1 min fa',
        isOrganizer: false
      }
    ]
  };

  const [userReaction, setUserReaction] = useState<string | null>(null);

  const reactionIcons = {
    hearts: Heart,
    likes: ThumbsUp,
    stars: Star,
    fire: Flame
  };

  const getCategoryEmoji = (cat: string) => {
    const categories: Record<string, string> = {
      'calcio': '⚽',
      'aperitivo': '🍺',
      'feste': '🎉',
      'casa': '🏠',
      'sport': '🏃',
      'musica': '🎵',
      'arte': '🎨',
      'cibo': '🍕',
      'natura': '🌿'
    };
    return categories[cat.toLowerCase()] || '✨';
  };

  const handleParticipate = () => {
    if (!isParticipating) {
      setIsParticipating(true);
      setShowConfirmModal(true);
    } else {
      setIsParticipating(false);
      toast({
        title: "Partecipazione rimossa",
        description: "Non parteciperai più a questo momento"
      });
    }
  };

  const handleReaction = (reactionType: string) => {
    setUserReaction(userReaction === reactionType ? null : reactionType);
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      toast({
        title: "Messaggio inviato!",
        description: "Il tuo messaggio è stato inviato al gruppo"
      });
      setChatMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · {moment.title}</title>
        <meta name="description" content={moment.description} />
      </Helmet>

      {/* Header is handled by MinimalLayout */}

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Image */}
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-lg">
          {moment.image ? (
            <img 
              src={moment.image} 
              alt={moment.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-8xl">{getCategoryEmoji(moment.category)}</span>
            </div>
          )}
          
          {/* Reactions Overlay */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {Object.entries(moment.reactions).map(([type, count]) => {
              const Icon = reactionIcons[type as keyof typeof reactionIcons];
              return (
                <Button
                  key={type}
                  size="sm"
                  variant={userReaction === type ? "default" : "secondary"}
                  className="bg-background/90 backdrop-blur-sm hover:bg-background"
                  onClick={() => handleReaction(type)}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  <span>{count}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main Info */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold leading-tight">{moment.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {getCategoryEmoji(moment.category)} {moment.category}
                  </Badge>
                  {moment.mood && (
                    <Badge variant="outline">{moment.mood}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Time & Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{moment.date}</p>
                  <p className="text-sm text-muted-foreground">{moment.time}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{moment.location}</p>
                  <p className="text-sm text-muted-foreground">{moment.detailedLocation}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {moment.participants}/{moment.maxParticipants} partecipanti
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {moment.maxParticipants - moment.participants} posti disponibili
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Descrizione</h3>
              <p className="text-muted-foreground leading-relaxed">{moment.description}</p>
            </div>

            {/* Tags */}
            {moment.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {moment.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Why Come */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Perché Venire?
              </h3>
              <div className="space-y-2">
                {moment.whyCome.map((reason, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizer */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Organizzatore</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={moment.organizer.avatar} />
                <AvatarFallback>{moment.organizer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{moment.organizer.name}</h4>
                  {moment.organizer.verified && (
                    <Badge variant="secondary" className="text-xs">Verificato</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{moment.organizer.age} anni</p>
                <p className="text-sm text-muted-foreground mt-2">{moment.organizer.bio}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowChat(!showChat)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chatta
              </Button>
              <Button variant="outline">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Section */}
        {showChat && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Chat del Gruppo</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {moment.chatMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{msg.user}</span>
                        {msg.isOrganizer && (
                          <Badge variant="secondary" className="text-xs">Organizzatore</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm mt-1">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Scrivi un messaggio..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 min-h-[40px] max-h-[80px]"
                />
                <Button onClick={sendMessage} disabled={!chatMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-2">
          <Button 
            size="lg" 
            className="w-full"
            onClick={handleParticipate}
            variant={isParticipating ? "outline" : "default"}
          >
            {isParticipating ? "Annulla Partecipazione" : "Partecipa al Momento"}
          </Button>
          <Button 
            variant="outline"
            size="lg" 
            className="w-full"
            onClick={() => navigate(`/chat/moment/${moment.id}`)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chatta con il gruppo
          </Button>
        </div>

        {/* Add bottom padding to prevent content being hidden behind fixed buttons */}
        <div className="h-24" />

        {/* Participation Confirmation Modal */}
        <ParticipationConfirmModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          momentTitle={moment.title}
          momentId={moment.id}
        />
      </div>
    </div>
  );
}