import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Edit,
  Share2,
  Euro,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ParticipationConfirmModal } from "@/components/ParticipationConfirmModal";
import { MomentEditModal } from "@/components/moments/MomentEditModal";
import { MomentStories } from "@/components/moments/MomentStories";
import { MomentHeader } from "@/components/moments/MomentHeader";
import { ShareModal } from "@/components/shared/ShareModal";
import { TicketPurchaseModal } from "@/components/tickets/TicketPurchaseModal";
import { useMomentDetail } from "@/hooks/useMomentDetail";
import { useMomentTickets } from "@/hooks/useMomentTickets";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function MomentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isParticipating, setIsParticipating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [hasUserPaid, setHasUserPaid] = useState(false);

  // Ticket purchase functionality
  const { hasUserPaidForMoment } = useMomentTickets();

  // Fetch real moment data
  const { moment, isLoading, error, refreshMoment } = useMomentDetail(id || '');

  // Check if user is host
  const isHost = user && moment && user.id === moment.host_id;

  // Check if user has paid for this moment
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (moment?.id && user && moment.payment_required) {
        const hasPaid = await hasUserPaidForMoment(moment.id);
        setHasUserPaid(hasPaid);
      }
    };
    
    checkPaymentStatus();
  }, [moment?.id, user, hasUserPaidForMoment, moment?.payment_required]);

  // Set up real-time participant count updates
  useEffect(() => {
    if (!moment?.id) return;

    // Initial count
    setParticipantCount(moment.participant_count || 0);

    // Real-time subscription
    const channel = supabase
      .channel(`moment_participants:${moment.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'moment_participants', filter: `moment_id=eq.${moment.id}` },
        async () => {
          // Refresh participant count
          const { data, error } = await supabase
            .from('moment_participants')
            .select('*')
            .eq('moment_id', moment.id)
            .eq('status', 'confirmed');
          
          if (!error && data) {
            setParticipantCount(data.length);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [moment?.id]);

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
    // Check if moment requires payment
    if (moment?.payment_required && !hasUserPaid) {
      setShowTicketModal(true);
      return;
    }

    // For free moments or already paid users
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

  const formatPrice = (priceInCents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(priceInCents / 100);
  };

  const handleReaction = (reactionType: string) => {
    setUserReaction(userReaction === reactionType ? null : reactionType);
  };

  const handleDeleteSuccess = () => {
    navigate('/momenti');
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · {moment.title}</title>
        <meta name="description" content={moment.description} />
      </Helmet>

      {/* Moment Header */}
      <MomentHeader
        title={moment.title}
        isHost={moment.can_edit || false}
        isParticipant={isParticipating}
        onBack={() => navigate(-1)}
        onEdit={() => setShowEditModal(true)}
        onShare={() => setShowShareModal(true)}
        onDelete={() => handleDeleteSuccess()}
        onReport={() => toast({ title: "Segnalazione inviata", description: "Grazie per aver segnalato questo momento" })}
        onLeave={() => {
          setIsParticipating(false);
          toast({ title: "Momento abbandonato", description: "Non parteciperai più a questo momento" });
        }}
      />

      <div className="container mx-auto px-4 pt-20 pb-6 space-y-6">{/* Added pt-20 for header spacing */}
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
                    {participantCount}
                    {moment.max_participants && `/${moment.max_participants}`} partecipanti
                  </p>
                  {moment.max_participants && (
                    <p className="text-sm text-muted-foreground">
                      {moment.max_participants - participantCount} posti disponibili
                    </p>
                  )}
                </div>
              </div>

              {/* Price Information */}
              {moment.payment_required && moment.price_cents && moment.price_cents > 0 && (
                <div className="flex items-center gap-3">
                  <Euro className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {formatPrice(moment.price_cents, moment.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Biglietto richiesto per partecipare
                    </p>
                  </div>
                </div>
              )}
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

        {/* Host Ticketing Info Banner */}
        {isHost && moment.payment_required && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Ticketing Attivo</h4>
                  <p className="text-sm text-muted-foreground">
                    Prezzo: {formatPrice(moment.price_cents || 0, moment.currency)} 
                    • Fee Livemoment: {moment.livemoment_fee_percentage || 5}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              <Button variant="outline" className="flex-1" onClick={() => navigate(`/chat/moment/${moment.id}`)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chatta
              </Button>
              <ShareModal contentType="moment" contentId={moment.id} title={moment.title}>
                <Button variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </ShareModal>
            </div>
          </CardContent>
        </Card>


        {/* Action Buttons - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex items-center gap-3">
            {isHost ? (
              /* Host Actions */
              <>
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={() => navigate(`/chat/moment/${moment.id}`)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Entra in Chat
                </Button>
                
                <ShareModal contentType="moment" contentId={moment.id} title={moment.title}>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="p-3"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </ShareModal>
              </>
            ) : (
              /* Participant Actions */
              <>
                {(() => {
                  // Check if sold out
                  const isSoldOut = moment.max_participants && participantCount >= moment.max_participants;
                  
                  // If payment required
                  if (moment.payment_required) {
                    if (hasUserPaid) {
                      return (
                        <>
                          <Button 
                            size="lg" 
                            className="flex-1"
                            onClick={() => navigate(`/chat/moment/${moment.id}`)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Entra in Chat
                          </Button>
                          <Badge className="px-3 py-2 bg-green-50 text-green-700 border-green-200">
                            Pagato
                          </Badge>
                        </>
                      );
                    } else if (isSoldOut) {
                      return (
                        <Button size="lg" className="flex-1" disabled>
                          Sold Out
                        </Button>
                      );
                    } else {
                      return (
                        <Button 
                          size="lg" 
                          className="flex-1"
                          onClick={handleParticipate}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Acquista Biglietto - {formatPrice(moment.price_cents || 0, moment.currency)}
                        </Button>
                      );
                    }
                  } else {
                    // Free moments
                    if (isSoldOut) {
                      return (
                        <Button size="lg" className="flex-1" disabled>
                          Sold Out
                        </Button>
                      );
                    } else {
                      return (
                        <>
                          <Button 
                            size="lg" 
                            className="flex-1"
                            onClick={handleParticipate}
                            variant={isParticipating ? "outline" : "default"}
                          >
                            {isParticipating ? "Annulla Partecipazione" : "Partecipa al Momento"}
                          </Button>
                          
                          {/* Chat icon - only visible after participation */}
                          {isParticipating && (
                            <Button
                              variant="outline"
                              size="lg"
                              className="p-3"
                              onClick={() => navigate(`/chat/moment/${moment.id}`)}
                            >
                              <MessageCircle className="h-5 w-5" />
                            </Button>
                          )}
                        </>
                      );
                    }
                  }
                })()}
              </>
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

        {/* Ticket Purchase Modal */}
        {moment.payment_required && (
          <TicketPurchaseModal
            open={showTicketModal}
            onOpenChange={setShowTicketModal}
            moment={{
              id: moment.id,
              title: moment.title,
              description: moment.description || '',
              when_at: moment.when_at || '',
              place: moment.place,
              price_cents: moment.price_cents || 0,
              currency: moment.currency || 'EUR',
              livemoment_fee_percentage: moment.livemoment_fee_percentage || 5,
              organizer_fee_percentage: moment.organizer_fee_percentage || 0,
              participant_count: participantCount,
              max_participants: moment.max_participants || null
            }}
          />
        )}

        {/* Edit Modal */}
        {moment.can_edit && (
          <MomentEditModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            moment={moment}
            onSuccess={refreshMoment}
            onDelete={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  );
}