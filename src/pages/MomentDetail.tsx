import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Clock, Users, Heart, ThumbsUp, Star, Flame, MessageCircle, Send, UserPlus, Calendar, Info, Settings, Edit, Share2, Euro, CreditCard, Navigation, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ParticipationConfirmModal } from "@/components/ParticipationConfirmModal";
import { MomentEditModal } from "@/components/moments/MomentEditModal";
import { MomentStories } from "@/components/moments/MomentStories";
import { MomentHeader } from "@/components/moments/MomentHeader";
import { ReactionBar } from "@/components/moments/ReactionBar";
import { MapPreviewDialog } from "@/components/moments/MapPreviewDialog";
import { ShareModal } from "@/components/shared/ShareModal";
import { TicketPurchaseModal } from "@/components/tickets/TicketPurchaseModal";
import { useMomentDetail } from "@/hooks/useMomentDetail";
import { useMomentTickets } from "@/hooks/useMomentTickets";
import { useReverseGeocoding } from "@/hooks/useReverseGeocoding";
import { useMoments } from "@/hooks/useMoments";
import { useDeleteContent } from "@/hooks/useContentActions";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";
export default function MomentDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [hasUserPaid, setHasUserPaid] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState<any[]>([]);
  const [locationInfo, setLocationInfo] = useState<{
    street: string;
    city: string;
    formatted_address: string;
    province: string;
  } | null>(null);
  const {
    reverseGeocode
  } = useReverseGeocoding();

  // Ticket purchase functionality
  const {
    hasUserPaidForMoment
  } = useMomentTickets();

  // Fetch real moment data
  const {
    moment,
    isLoading,
    error,
    refreshMoment
  } = useMomentDetail(id || '');
  const {
    joinMoment,
    leaveMoment
  } = useMoments();
  const deleteMoment = useDeleteContent('moments');

  // Check if user is host
  const isHost = user && moment && user.id === moment.host_id;

  // Check if user has paid for this moment and handle payment verification
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (moment?.id && user && moment.payment_required) {
        // Check URL for payment success/failure
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        if (sessionId) {
          // Verify payment status
          await useMomentTickets().verifyPayment(sessionId);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        const hasPaid = await hasUserPaidForMoment(moment.id);
        setHasUserPaid(hasPaid);
      }
    };
    checkPaymentStatus();
  }, [moment?.id, user, hasUserPaidForMoment, moment?.payment_required]);

  // Check participation status and set up real-time updates
  useEffect(() => {
    if (!moment?.id || !user) return;
    const checkParticipationAndCount = async () => {
      // Check if user is participating
      const {
        data: participation
      } = await supabase.from('moment_participants').select('id').eq('moment_id', moment.id).eq('user_id', user.id).eq('status', 'confirmed').maybeSingle();
      setIsParticipating(!!participation);

      // Get participant count from moment.participants array
      const count = moment.participants?.length || 0;
      setParticipantCount(count);

      // Get participant profiles (max 6 for display)
      if (moment.participants && moment.participants.length > 0) {
        const participantIds = moment.participants.slice(0, 6);
        const {
          data: profiles
        } = await supabase.from('profiles').select('id, name, avatar_url').in('id', participantIds);
        if (profiles) {
          setParticipantProfiles(profiles.map(p => ({
            user_id: p.id,
            profiles: p
          })));
        }
      }
    };
    checkParticipationAndCount();

    // Real-time subscription on moments table
    const channel = supabase.channel(`moment:${moment.id}`).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'moments',
      filter: `id=eq.${moment.id}`
    }, () => {
      refreshMoment();
      checkParticipationAndCount();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [moment?.id, moment?.participants, user, refreshMoment]);

  // Load location info when moment is loaded
  useEffect(() => {
    if (moment?.place?.coordinates?.lat && moment?.place?.coordinates?.lng && !locationInfo) {
      reverseGeocode(moment.place.coordinates.lat, moment.place.coordinates.lng).then(result => {
        if (result) {
          setLocationInfo(result);
        }
      }).catch(error => {
        console.error('Error getting location info:', error);
      });
    }
  }, [moment, locationInfo, reverseGeocode]);
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento momento...</p>
        </div>
      </div>;
  }
  if (error || !moment) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Momento non trovato'}</p>
          <Button onClick={() => navigate('/')}>Torna alla home</Button>
        </div>
      </div>;
  }

  // Mock chat messages for now - will be implemented later

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
      'spontaneo': '🎲',
      'relax': '😌',
      'energia': '⚡',
      'avventura': '🗺️',
      'social': '👥'
    };
    return categories[tag.toLowerCase()] || '';
  };
  const handleParticipate = async () => {
    if (!moment?.id) return;

    // Check if moment requires payment
    if (moment?.payment_required && !hasUserPaid) {
      setShowTicketModal(true);
      return;
    }

    // For free moments or already paid users
    if (!isParticipating) {
      const success = await joinMoment(moment.id);
      if (success) {
        setShowConfirmModal(true);
      }
    } else {
      await leaveMoment(moment.id);
    }
  };
  const formatPrice = (priceInCents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(priceInCents / 100);
  };
  const handleDelete = async () => {
    if (!moment?.id) return;
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo momento? Sarà archiviato per 30 giorni prima dell\'eliminazione definitiva.');
    if (confirmed) {
      try {
        await deleteMoment.mutateAsync(moment.id);
        navigate('/momenti');
      } catch (error) {
        console.error('Error deleting moment:', error);
        // Toast already shown by useDeleteContent
      }
    }
  };
  const openInMaps = () => {
    if (!moment?.place?.coordinates) return;
    const {
      lat,
      lng
    } = moment.place.coordinates;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(mapsUrl, '_blank');
  };
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · {moment.title}</title>
        <meta name="description" content={moment.description} />
      </Helmet>

      {/* Moment Header */}
      <MomentHeader title={moment.title} isHost={moment.can_edit || false} isParticipant={isParticipating} onEdit={() => setShowEditModal(true)} onShare={() => setShowShareModal(true)} onDelete={handleDelete} onReport={() => toast({
      title: "Segnalazione inviata",
      description: "Grazie per aver segnalato questo momento"
    })} onLeave={() => {
      setIsParticipating(false);
      toast({
        title: "Momento abbandonato",
        description: "Non parteciperai più a questo momento"
      });
    }} />

      <div className="container mx-auto px-4 pt-20 pb-24 space-y-6">{/* Added pt-20 for header spacing, pb-24 for bottom fixed buttons */}
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
          {moment.can_edit && <div className="absolute top-4 right-4 z-10">
              <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-lg" onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>}
          
          {/* Mood badge - top center */}
          {moment.mood_tag && <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-lg">
                {moment.mood_tag}
              </Badge>
            </div>}
          
          {moment.photos && moment.photos.length > 0 ? <img src={moment.photos[0]} alt={moment.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-8xl">
                {moment.tags && moment.tags.length > 0 ? getCategoryEmoji(moment.tags[0]) : '📍'}
              </span>
            </div>}
          
          {/* Reactions */}
          <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
            <ReactionBar momentId={moment.id} />
          </div>
        </div>

        {/* Stories Section - Always visible */}
        <MomentStories momentId={moment.id} canContribute={isParticipating || moment.can_edit || moment.participants && user && moment.participants.includes(user.id)} />

        {/* Main Info */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold leading-tight">{moment.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  {moment.tags && moment.tags.map(tag => <Badge key={tag} variant="secondary">
                      {getCategoryEmoji(tag)} {tag}
                    </Badge>)}
                  {moment.mood_tag && <Badge variant="outline">{moment.mood_tag}</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Time & Location */}
            <div className="space-y-3">
              {moment.when_at && <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(moment.when_at), "EEEE d MMMM", {
                    locale: it
                  })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(moment.when_at), "HH:mm")}
                    </p>
                  </div>
                </div>}
              
              {moment.place && <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    {locationInfo ? <div className="space-y-1">
                        <p className="font-medium">{locationInfo.city}, {locationInfo.province}</p>
                        <p className="text-sm text-muted-foreground">{locationInfo.street}</p>
                      </div> : <p className="font-medium">{moment.place.name}</p>}
                    <div className="flex gap-2 mt-2">
                      
                      <Button variant="outline" size="sm" onClick={openInMaps} className="text-xs">
                        <Navigation className="h-3 w-3 mr-1" />
                        Apri in Maps
                      </Button>
                    </div>
                  </div>
                </div>}

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {/* Avatar in fila */}
                    {participantProfiles.length > 0 && <div className="flex space-x-2">
                        {participantProfiles.slice(0, 6).map((participant: any) => <Avatar key={participant.user_id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={participant.profiles?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {participant.profiles?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>)}
                        {participantCount > 6 && <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                            +{participantCount - 6}
                          </div>}
                      </div>}
                    <div>
                      <p className="font-medium">
                        {participantCount}
                        {moment.max_participants && `/${moment.max_participants}`} partecipanti
                      </p>
                      {moment.max_participants && <p className="text-sm text-muted-foreground">
                          {moment.max_participants - participantCount} posti disponibili
                        </p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              {moment.payment_required && moment.price_cents && moment.price_cents > 0 && <div className="flex items-center gap-3">
                  <Euro className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {formatPrice(moment.price_cents, moment.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Biglietto richiesto per partecipare
                    </p>
                  </div>
                </div>}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Descrizione</h3>
              <p className="text-muted-foreground leading-relaxed">{moment.description}</p>
            </div>

            {/* Tags */}
            {moment.tags && moment.tags.length > 0 && <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {moment.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>)}
                </div>
              </div>}
          </CardContent>
        </Card>

        {/* Host Ticketing Info Banner */}
        {isHost && moment.payment_required && <Card className="border-primary/20 bg-primary/5">
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
          </Card>}

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
                  {moment.host?.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                </div>
                {moment.host?.bio && <p className="text-sm text-muted-foreground mt-2">{moment.host.bio}</p>}
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
            {isHost ? (/* Host Actions */
          <>
                <Button size="lg" className="flex-1" onClick={() => navigate(`/chat/moment/${moment.id}`)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Entra in Chat
                </Button>
                
                <ShareModal contentType="moment" contentId={moment.id} title={moment.title}>
                  <Button variant="outline" size="lg" className="p-3">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </ShareModal>
              </>) : (/* Participant Actions */
          <>
                {(() => {
              // Check if sold out
              const isSoldOut = moment.max_participants && participantCount >= moment.max_participants;

              // If payment required
              if (moment.payment_required) {
                if (hasUserPaid) {
                  return <>
                          <Button size="lg" className="flex-1" onClick={() => navigate(`/chat/moment/${moment.id}`)}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Entra in Chat
                          </Button>
                          <Badge className="px-3 py-2 bg-green-50 text-green-700 border-green-200">
                            Pagato
                          </Badge>
                        </>;
                } else if (isSoldOut) {
                  return <Button size="lg" className="flex-1" disabled>
                          Sold Out
                        </Button>;
                } else {
                  return <Button size="lg" className="flex-1" onClick={handleParticipate}>
                          Partecipa - {formatPrice(moment.price_cents || 0, moment.currency)}
                        </Button>;
                }
              } else {
                // Free moments
                if (isSoldOut) {
                  return <Button size="lg" className="flex-1" disabled>
                          Sold Out
                        </Button>;
                } else {
                  return <>
                          <Button size="lg" className="flex-1" onClick={isParticipating ? () => navigate(`/chat/moment/${moment.id}`) : handleParticipate}>
                            {isParticipating ? <>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Entra in Chat
                              </> : "Partecipa al Momento"}
                          </Button>
                          
                          {/* Cancel participation button - only visible after participation */}
                          {isParticipating && <Button variant="outline" size="lg" className="p-3" onClick={handleParticipate}>
                              <X className="h-5 w-5" />
                            </Button>}
                        </>;
                }
              }
            })()}
              </>)}
          </div>
        </div>

        {/* Participation Confirmation Modal */}
        <ParticipationConfirmModal open={showConfirmModal} onOpenChange={setShowConfirmModal} momentTitle={moment.title} momentId={moment.id} />

        {/* Ticket Purchase Modal */}
        {moment.payment_required && <TicketPurchaseModal open={showTicketModal} onOpenChange={setShowTicketModal} moment={{
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
      }} />}

        {/* Edit Modal */}
        {moment.can_edit && <MomentEditModal open={showEditModal} onOpenChange={setShowEditModal} moment={moment} onSuccess={refreshMoment} onDelete={handleDelete} />}

        {/* Map Preview Modal */}
        {moment?.place?.coordinates?.lat && moment?.place?.coordinates?.lng && <MapPreviewDialog open={showMapModal} onOpenChange={setShowMapModal} location={{
        lat: moment.place.coordinates.lat,
        lng: moment.place.coordinates.lng,
        name: moment.place.name,
        address: locationInfo?.formatted_address
      }} />}
      </div>
    </div>;
}