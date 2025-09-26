import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PersonalityBadge } from "@/components/profile/PersonalityBadge";
import { EnhancedPhotoGallery } from "@/components/profile/EnhancedPhotoGallery";
import { MessageCircle, UserPlus, CheckCircle, Instagram, MapPin, Heart, ArrowLeft, Calendar, Users, UserCheck, Clock, Briefcase, Star, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendship } from "@/hooks/useFriendship";
import { toast } from 'sonner';
const fetchUserProfileById = async (userId: string) => {
  console.log('🔍 Fetching profile for user ID:', userId);
  const {
    data,
    error
  } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  console.log('📊 Profile query result:', {
    data,
    error
  });
  if (error) {
    console.error('❌ Error fetching profile:', error);
    throw error;
  }
  if (!data) {
    console.warn('⚠️ No profile data found for user ID:', userId);
  }
  return data;
};

const fetchUserMetrics = async (userId: string) => {
  try {
    // Get user's public moments count
    const { count: momentsCount } = await supabase
      .from('moments')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', userId)
      .eq('is_public', true)
      .is('deleted_at', null);

    // Get user's public events count
    const { count: eventsCount } = await supabase
      .from('events')  
      .select('*', { count: 'exact', head: true })
      .eq('host_id', userId)
      .eq('discovery_on', true)
      .is('deleted_at', null);

    // Get user's friends count (accepted friendships)
    const { count: friendsCount } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},friend_user_id.eq.${userId}`)
      .eq('status', 'accepted');

    return {
      friendsCount: friendsCount || 0,
      eventsCount: eventsCount || 0,
      momentsCount: momentsCount || 0
    };
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return {
      friendsCount: 0,
      eventsCount: 0,
      momentsCount: 0
    };
  }
};
export default function UserDetailById() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    sendFriendRequest,
    friends,
    pendingRequests
  } = useFriendship();
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends'>('none');
  console.log('🔍 UserDetailById loaded with ID:', id);
  console.log('👤 Current user:', user?.id);
  console.log('🔗 ID type check:', typeof id, 'ID length:', id?.length);
  console.log('🔍 URL pathname:', window.location.pathname);
  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-profile-by-id', id],
    queryFn: () => fetchUserProfileById(id!),
    enabled: !!id,
    retry: 1
  });

  const {
    data: userMetrics,
    isLoading: metricsLoading
  } = useQuery({
    queryKey: ['user-metrics', id],
    queryFn: () => fetchUserMetrics(id!),
    enabled: !!id && !!profile,
    retry: 1
  });

  const {
    data: userAvailability,
    isLoading: availabilityLoading
  } = useQuery({
    queryKey: ['user-availability', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user availability:', error);
        return null;
      }
      return data;
    },
    enabled: !!id,
    retry: 1
  });

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (!userAvailability) return 'offline';
    
    if (userAvailability.is_on && userAvailability.shareable) {
      if (userAvailability.end_at) {
        const now = new Date();
        const endTime = new Date(userAvailability.end_at);
        if (now <= endTime) {
          return 'available';
        }
      } else {
        return 'available';
      }
    }
    
    return 'online'; // Assume online if we can see their profile
  };

  const availabilityStatus = getAvailabilityStatus();
  console.log('📊 Profile query state:', {
    profile,
    isLoading,
    error,
    id
  });

  // Check friendship status
  useEffect(() => {
    if (profile && user && friends && pendingRequests) {
      const isFriend = friends.some(f => f.friend?.id === profile.id);
      const hasPendingRequest = pendingRequests.some(r => r.user_id === profile.id);
      
      if (isFriend) {
        setFriendshipStatus('friends');
      } else if (hasPendingRequest) {
        setFriendshipStatus('pending');
      } else {
        setFriendshipStatus('none');
      }
    }
  }, [profile, user, friends, pendingRequests]);
  const handleAddFriend = async () => {
    if (!profile || !user) return;
    if (friendshipStatus === 'friends') {
      toast.info('Sei già amico di questa persona');
      return;
    }
    if (friendshipStatus === 'pending') {
      toast.info('Richiesta di amicizia già inviata');
      return;
    }
    const success = await sendFriendRequest(profile.id);
    if (success) {
      setFriendshipStatus('pending');
    }
  };
  const handleMessage = async () => {
    if (!profile || !user) return;
    
    // Check chat permissions
    if (profile.chat_permission === 'friends_only' && friendshipStatus !== 'friends') {
      toast.error('Puoi inviare messaggi solo agli amici secondo le impostazioni di questo utente');
      return;
    }
    
    try {
      // Check if conversation already exists
      const {
        data: existingConversation
      } = await supabase.from('conversations').select('id').or(`and(participant_1.eq.${user.id},participant_2.eq.${profile.id}),and(participant_1.eq.${profile.id},participant_2.eq.${user.id})`).maybeSingle();
      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/chat/${existingConversation.id}`);
      } else {
        // Create new conversation
        const {
          data: newConversation,
          error
        } = await supabase.from('conversations').insert({
          participant_1: user.id,
          participant_2: profile.id
        }).select('id').maybeSingle();
        if (error) throw error;

        // Navigate to new conversation
        navigate(`/chat/${newConversation.id}`);
      }
    } catch (error) {
      console.error('Error creating/opening conversation:', error);
      toast.error('Errore nell\'aprire la chat');
    }
  };

  const suggestAvailability = () => {
    toast.info('Suggerimento inviato! L\'utente riceverà una notifica per impostare la disponibilità');
    // In a real app, this would send a notification to the user
  };

  const getOnlineStatusBadge = () => {
    if (availabilityStatus === 'available') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
          Disponibile
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <div className="h-2 w-2 bg-blue-500 rounded-full mr-1" />
          Online
        </Badge>
      );
    }
  };
  if (isLoading) {
    return <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>;
  }
  if (error) {
    console.error('❌ Error in UserDetailById:', error);
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Errore nel caricamento</h2>
          <p className="text-muted-foreground">
            Si è verificato un errore nel caricamento del profilo.
          </p>
          <div className="space-x-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              Indietro
            </Button>
            <Button onClick={() => navigate('/trova-amici')}>
              Trova Altri Utenti
            </Button>
          </div>
        </div>
      </div>;
  }
  if (!profile) {
    console.warn('⚠️ Profile not found for ID:', id);
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Profilo non trovato</h2>
          <p className="text-muted-foreground">
            Questo utente potrebbe aver impostato il profilo come privato o non esiste più.
          </p>
          <div className="space-x-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              Indietro
            </Button>
            <Button onClick={() => navigate('/trova-amici')}>
              Trova Altri Utenti
            </Button>
          </div>
        </div>
      </div>;
  }
  const canMessage = profile.chat_permission === 'everyone' || (profile.chat_permission === 'friends_only' && friendshipStatus === 'friends');
  
  return <>
      <Helmet>
        <title>{profile.name || profile.username} - LiveMoment</title>
        <meta name="description" content={profile.bio || `Profilo di ${profile.name || profile.username} su LiveMoment`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pb-6 max-w-2xl space-y-6">
          {/* Enhanced Profile Header */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-brand text-white text-xl font-medium">
                      {profile.name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Dynamic status indicator */}
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 border-2 border-background rounded-full flex items-center justify-center ${
                    availabilityStatus === 'available' ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold text-foreground">
                          {profile.name || profile.username}
                        </h1>
                        {profile.is_verified && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                      {profile.username && profile.name && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                    </div>
                  </div>
                  
                  {/* Status badges - improved */}
                  <div className="flex items-start gap-1.5 sm:gap-2 mb-3 flex-wrap">
                    {getOnlineStatusBadge()}
                    {profile.mood && profile.mood.split(', ').filter(m => m.length > 0).map((moodItem: string) => (
                      <Badge key={moodItem} variant="outline" className="text-xs sm:text-sm">
                        <Heart className="h-3 w-3 mr-1" />
                        {moodItem}
                      </Badge>
                    ))}
                    {profile.gender && (
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        {profile.gender}
                      </Badge>
                    )}
                  </div>
                  
                  {profile.bio && <div className="text-sm text-muted-foreground mb-3 line-clamp-2 break-words max-w-full">
                      {profile.bio}
                    </div>}
                  
                  {profile.job_title && <div className="text-sm font-medium mb-2">
                      <Briefcase className="h-3 w-3 inline mr-1" />
                      {profile.job_title}
                    </div>}
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    {canMessage && (
                      <Button size="sm" className="flex-1" onClick={handleMessage}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Messaggio
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant={friendshipStatus === 'friends' ? "outline" : "default"} 
                      className="flex-1" 
                      onClick={handleAddFriend} 
                      disabled={friendshipStatus === 'pending'}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {friendshipStatus === 'friends' ? 'Amici' : friendshipStatus === 'pending' ? 'Richiesta inviata' : 'Aggiungi amico'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="shadow-card hover:shadow-elevated transition-smooth">
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="font-bold text-2xl">
                    {metricsLoading ? '-' : userMetrics?.friendsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Amici</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-smooth">
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-full bg-secondary/10">
                    <Calendar className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="font-bold text-2xl">
                    {metricsLoading ? '-' : userMetrics?.eventsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Eventi</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-smooth">
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-full bg-accent/10">
                    <Activity className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="font-bold text-2xl">
                    {metricsLoading ? '-' : userMetrics?.momentsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Momenti</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Availability Section */}
          {userAvailability && userAvailability.is_on && userAvailability.shareable && availabilityStatus === 'available' && (
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Disponibilità</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Disponibile ora
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {profile.name || profile.username} è disponibile per inviti e attività
                </div>
                {userAvailability.end_at && (
                  <div className="text-xs text-muted-foreground">
                    Fino alle {new Date(userAvailability.end_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Suggest availability if user has none */}
          {(!userAvailability || !userAvailability.is_on || !userAvailability.shareable) && friendshipStatus === 'friends' && (
            <Card className="shadow-card border-dashed border-2">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-sm font-medium mb-1">Nessuna disponibilità impostata</div>
                <div className="text-xs text-muted-foreground mb-3">
                  Suggerisci a {profile.name || profile.username} di impostare la disponibilità
                </div>
                <Button size="sm" variant="outline" onClick={suggestAvailability}>
                  <Star className="h-3 w-3 mr-1" />
                  Suggerisci disponibilità
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Bio e Informazioni Dettagliate */}
          <Card className="shadow-card">
            <CardContent className="pt-6 space-y-4">
              {profile.bio && <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.personality_type && <div>
                    <h4 className="font-medium mb-2">Personalità</h4>
                    <PersonalityBadge type={profile.personality_type} />
                  </div>}
                
                {profile.relationship_status && <div>
                    <h4 className="font-medium mb-2">Stato relazione</h4>
                    <Badge variant="secondary">{profile.relationship_status}</Badge>
                  </div>}
              </div>
              
              {profile.interests && profile.interests.length > 0 && <div>
                  <h4 className="font-medium mb-2">Interessi</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map(interest => <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>)}
                  </div>
                </div>}
              
              {profile.instagram_username && <div>
                  <h4 className="font-medium mb-2">Social</h4>
                  <a href={`https://instagram.com/${profile.instagram_username}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors">
                    <Instagram className="h-4 w-4" />
                    @{profile.instagram_username}
                  </a>
                </div>}
            </CardContent>
          </Card>

          {/* Photo Gallery - Enhanced and Moved Down */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Galleria Foto
            </h2>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <EnhancedPhotoGallery 
                  photos={profile.gallery || []} 
                  isOwnProfile={false}
                  className="max-w-sm mx-auto"
                />
              </CardContent>
            </Card>
          </div>

          {/* Public Moments Section */}
          <Card className="shadow-card">
            <CardContent className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Momenti Pubblici</h3>
              <p className="text-muted-foreground text-sm">
                {userMetrics?.momentsCount ? 
                  `${profile.name || profile.username} ha condiviso ${userMetrics.momentsCount} momenti pubblici` :
                  `I momenti pubblici di ${profile.name || profile.username} appariranno qui`
                }
              </p>
            </CardContent>
          </Card>

          {/* Bottom padding for better UX */}
          <div className="h-8" />
        </div>
      </div>
    </>;
}