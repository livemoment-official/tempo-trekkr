import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PersonalityBadge } from "@/components/profile/PersonalityBadge";
import { PhotoGalleryCarousel } from "@/components/profile/PhotoGalleryCarousel";
import { MessageCircle, UserPlus, CheckCircle, Instagram, MapPin, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

const fetchUserProfile = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => fetchUserProfile(username!),
    enabled: !!username,
  });

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow API call
  };

  const handleMessage = () => {
    // TODO: Implement message functionality
    console.log('Opening chat with', profile?.username);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Profilo non trovato</h2>
            <p className="text-muted-foreground">
              L'utente che stai cercando non esiste o ha reso privato il suo profilo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canMessage = profile.chat_permission === 'everyone' || 
    (profile.chat_permission === 'followers_only' && isFollowing);

  return (
    <>
      <Helmet>
        <title>{profile.name || profile.username} - LiveMoment</title>
        <meta 
          name="description" 
          content={profile.bio || `Profilo di ${profile.name || profile.username} su LiveMoment`} 
        />
      </Helmet>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Galleria foto principale */}
        <Card>
          <CardContent className="p-4">
            <PhotoGalleryCarousel
              photos={profile.gallery || []}
              isOwnProfile={false}
            />
          </CardContent>
        </Card>

        {/* Header del Profilo */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-brand text-white text-xl font-medium">
                  {profile.name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">
                      {profile.name || profile.username}
                    </h1>
                    {profile.is_verified && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  {profile.username && profile.name && (
                    <p className="text-muted-foreground">@{profile.username}</p>
                  )}
                </div>
                
                {profile.job_title && (
                  <p className="text-foreground font-medium">{profile.job_title}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span><strong className="text-foreground">{profile.followers_count}</strong> follower</span>
                  <span><strong className="text-foreground">{profile.following_count}</strong> seguiti</span>
                </div>
                
                <div className="flex gap-2">
                  {canMessage && (
                    <Button size="sm" className="flex-1" onClick={handleMessage}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messaggio
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant={isFollowing ? "outline" : "default"} 
                    className="flex-1"
                    onClick={handleFollow}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isFollowing ? 'Seguendo' : 'Segui'}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Bio e Informazioni */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.personality_type && (
                <div>
                  <h4 className="font-medium mb-2">Personalità</h4>
                  <PersonalityBadge type={profile.personality_type} />
                </div>
              )}
              
              {profile.mood && (
                <div>
                  <h4 className="font-medium mb-2">Mood</h4>
                  <Badge variant="outline">
                    <Heart className="h-3 w-3 mr-1" />
                    {profile.mood}
                  </Badge>
                </div>
              )}
              
              {profile.relationship_status && (
                <div>
                  <h4 className="font-medium mb-2">Stato relazione</h4>
                  <Badge variant="secondary">{profile.relationship_status}</Badge>
                </div>
              )}
            </div>
            
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Interessi</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {profile.instagram_username && (
              <div>
                <h4 className="font-medium mb-2">Social</h4>
                <a 
                  href={`https://instagram.com/${profile.instagram_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  @{profile.instagram_username}
                </a>
              </div>
            )}
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
      </div>
    </>
  );
}