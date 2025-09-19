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
  Info,
  Settings,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ParticipationConfirmModal } from "@/components/ParticipationConfirmModal";
import { MomentEditModal } from "@/components/moments/MomentEditModal";
import { MomentStories } from "@/components/moments/MomentStories";
import { useMomentDetail } from "@/hooks/useMomentDetail";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function MomentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isParticipating, setIsParticipating] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Fetch real moment data
  const { moment, isLoading, error, refreshMoment } = useMomentDetail(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento momento...</p>
        </div>
      </div>
    );
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Momento non trovato'}</p>
          <Button onClick={() => navigate('/')}>Torna alla home</Button>
        </div>
      </div>
    );
  }

  // Mock reactions for now - will be implemented later
  const reactions = {
    hearts: 24,
    likes: 18,
    stars: 15,
    fire: 8
  };

  // Mock chat messages for now - will be implemented later
  const chatMessages = [
    {
      id: '1',
      user: moment.host?.name?.split(' ')[0] + ' ' + (moment.host?.name?.split(' ')[1]?.charAt(0) || '') + '.',
      message: 'Ciao a tutti! Non vedo l\'ora di incontrarvi 🎉',
      time: '5 min fa',
      isOrganizer: true
    }
  ];


  const reactionIcons = {
    hearts: Heart,
    likes: ThumbsUp,
    stars: Star,
    fire: Flame
  };

  const getCategoryEmoji = (tag: string) => {
    const categories: Record<string, string> = {
      'calcio': '⚽',
      'aperitivo': '🍺', 
      'feste': '🎉',
      'casa': '🏠',
      'sport': '🏃',
      'musica': '🎵',
      'arte': '🎨',
      'cibo': '🍕',
      'natura': '🌿',
      'spontaneo': '✨',
      'relax': '😌',
      'energia': '⚡',
      'avventura': '🗺️',
      'social': '👥'
    };
    return categories[tag.toLowerCase()] || '✨';
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
        {/* Hero Image with organizer and mood */}
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-lg">
          {/* Organizer avatar - top left */}
          <div className="absolute top-4 left-4 z-10">
            <Avatar className="h-10 w-10 border-2 border-white shadow-lg">
              <AvatarImage src={moment.host?.avatar_url} />
              <AvatarFallback className="bg-white text-foreground">
                {moment.host?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Edit button - top right (for host only) */}
          {moment.can_edit && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm shadow-lg"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Mood badge - top center */}
          {moment.mood_tag && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-lg">
                {moment.mood_tag}
              </Badge>
            </div>
          )}
          
          {moment.photos && moment.photos.length > 0 ? (
            <img 
              src={moment.photos[0]} 
              alt={moment.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-8xl">
                {moment.tags && moment.tags.length > 0 
                  ? getCategoryEmoji(moment.tags[0])
                  : '✨'
                }
              </span>
            </div>
          )}
          
          {/* Reactions Overlay */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {Object.entries(reactions).map(([type, count]) => {
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

        {/* Stories Section */}
        <MomentStories 
          momentId={moment.id} 
          canContribute={isParticipating || moment.can_edit}
        />

        {/* Main Info */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold leading-tight">{moment.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  {moment.tags && moment.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {getCategoryEmoji(tag)} {tag}
                    </Badge>
                  ))}
                  {moment.mood_tag && (
                    <Badge variant="outline">{moment.mood_tag}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Time & Location */}
            <div className="space-y-3">
              {moment.when_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(moment.when_at), "EEEE d MMMM", { locale: it })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(moment.when_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              )}
              
              {moment.place && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{moment.place.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {moment.participant_count}
                    {moment.max_participants && `/${moment.max_participants}`} partecipanti
                  </p>
                  {moment.max_participants && (
                    <p className="text-sm text-muted-foreground">
                      {moment.max_participants - moment.participant_count} posti disponibili
                    </p>
                  )}
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
            {moment.tags && moment.tags.length > 0 && (
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
                <AvatarImage src={moment.host?.avatar_url} />
                <AvatarFallback>{moment.host?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{moment.host?.name || 'Utente'}</h4>
                  {moment.host?.verified && (
                    <Badge variant="secondary" className="text-xs">Verificato</Badge>
                  )}
                </div>
                {moment.host?.bio && (
                  <p className="text-sm text-muted-foreground mt-2">{moment.host.bio}</p>
                )}
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
                {chatMessages.map((msg) => (
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
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex items-center gap-3">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleParticipate}
              variant={isParticipating ? "outline" : "default"}
            >
              {isParticipating ? "Annulla Partecipazione" : "Partecipa al Momento"}
            </Button>
            
            {/* Small chat icon - only visible after participation */}
            {isParticipating && (
              <Button 
                variant="outline"
                size="lg"
                className="bg-white p-3"
                onClick={() => navigate(`/chat/organizer/${moment.host_id}`)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
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

        {/* Edit Modal */}
        {moment.can_edit && (
          <MomentEditModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            moment={moment}
            onSuccess={refreshMoment}
          />
        )}
      </div>
    </div>
  );
}