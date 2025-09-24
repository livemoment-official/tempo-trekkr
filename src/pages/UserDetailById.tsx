import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PersonalityBadge } from "@/components/profile/PersonalityBadge";
import { PhotoGalleryCarousel } from "@/components/profile/PhotoGalleryCarousel";
import { MessageCircle, UserPlus, CheckCircle, Instagram, MapPin, Heart, ArrowLeft } from "lucide-react";
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
    friends
  } = useFriendship();
  const [isFollowing, setIsFollowing] = useState(false);
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
  console.log('📊 Profile query state:', {
    profile,
    isLoading,
    error,
    id
  });

  // Check friendship status
  useEffect(() => {
    if (profile && user && friends) {
      const isFriend = friends.some(f => f.friend?.id === profile.id);
      setFriendshipStatus(isFriend ? 'friends' : 'none');
    }
  }, [profile, user, friends]);
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
  const canMessage = profile.chat_permission === 'everyone' || profile.chat_permission === 'friends_only' && friendshipStatus === 'friends';
  return <>
      <Helmet>
        <title>{profile.name || profile.username} - LiveMoment</title>
        <meta name="description" content={profile.bio || `Profilo di ${profile.name || profile.username} su LiveMoment`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        

        <div className="container mx-auto px-4 pb-6 max-w-2xl space-y-6">
          {/* Galleria foto principale */}
          <Card>
            <CardContent className="p-4">
              <PhotoGalleryCarousel photos={profile.gallery || []} isOwnProfile={false} />
            </CardContent>
          </Card>

          {/* Header del Profilo */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-brand text-white text-xl font-medium">
                      {profile.name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-foreground">
                        {profile.name || profile.username}
                      </h1>
                      {profile.is_verified && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                    {profile.username && profile.name && <p className="text-muted-foreground">@{profile.username}</p>}
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
                      Online
                    </Badge>
                    {profile.mood && <Badge variant="outline">
                        <Heart className="h-3 w-3 mr-1" />
                        {profile.mood}
                      </Badge>}
                  </div>
                  
                  {profile.job_title && <p className="text-foreground font-medium">{profile.job_title}</p>}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span><strong className="text-foreground">{profile.followers_count || 0}</strong> follower</span>
                    <span><strong className="text-foreground">{profile.following_count || 0}</strong> seguiti</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {canMessage && <Button size="sm" className="flex-1" onClick={handleMessage}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Messaggio
                      </Button>}
                    <Button size="sm" variant={friendshipStatus === 'friends' ? "outline" : "default"} className="flex-1" onClick={handleAddFriend} disabled={friendshipStatus === 'pending'}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {friendshipStatus === 'friends' ? 'Amici' : friendshipStatus === 'pending' ? 'Richiesta inviata' : 'Aggiungi amico'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Bio e Informazioni */}
          <Card>
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
                
                {profile.mood && <div>
                    <h4 className="font-medium mb-2">Mood</h4>
                    <Badge variant="outline">
                      <Heart className="h-3 w-3 mr-1" />
                      {profile.mood}
                    </Badge>
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

          {/* Momenti e Attività (placeholder per future implementazioni) */}
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="font-semibold mb-2">Momenti condivisi</h3>
              <p className="text-muted-foreground">
                I momenti di {profile.name || profile.username} appariranno qui.
              </p>
            </CardContent>
          </Card>

          {/* Bottom padding for better UX */}
          <div className="h-8" />
        </div>
      </div>
    </>;
}