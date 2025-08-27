import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AvailabilityForm } from "@/components/availability/AvailabilityForm";
import { AvailabilityList } from "@/components/availability/AvailabilityList";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { OnboardingModal } from "@/components/profile/OnboardingModal";
import { FriendshipSystem } from "@/components/friendship/FriendshipSystem";
import { PhotoGalleryCarousel } from "@/components/profile/PhotoGalleryCarousel";
import { ChatPermissionSettings } from "@/components/profile/ChatPermissionSettings";
import { FriendSuggestionsModal } from "@/components/profile/FriendSuggestionsModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { Crown, Settings, MessageCircle } from "lucide-react";
export default function Profilo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showFriendSuggestions, setShowFriendSuggestions] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/profilo";
  
  const { 
    isOnboardingRequired, 
    isLoading: onboardingLoading, 
    markOnboardingComplete,
    incrementRedirectCounter 
  } = useOnboardingState();

  useEffect(() => {
    if (isAuthenticated && user && isOnboardingRequired === false) {
      fetchProfile();
    }
  }, [isAuthenticated, user, isOnboardingRequired]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setIsProfileLoading(true);
      console.log('📋 Fetching profile data for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, will show onboarding');
          // Profile doesn't exist - onboarding will handle this
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        console.log('✅ Profile loaded successfully');
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    console.log('🎉 Onboarding completed, refreshing profile');
    markOnboardingComplete();
    fetchProfile(); // Reload profile data
  };

  const handlePhotosUpdate = async (photos: string[]) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ gallery: photos })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, gallery: photos });
    } catch (error) {
      console.error('Error updating gallery:', error);
    }
  };

  const handleChatPermissionUpdate = (newPermission: string) => {
    setProfile({ ...profile, chat_permission: newPermission });
  };

  if (!isAuthenticated) {
    return (
      <AuthGuard title="Accedi per vedere il profilo" description="Accedi per gestire il tuo profilo e le tue preferenze">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Accedi per vedere il tuo profilo</p>
        </div>
      </AuthGuard>
    );
  }

  // Show onboarding if required
  if (isOnboardingRequired === true) {
    return (
      <>
        <Helmet>
          <title>LiveMoment · Configurazione Profilo</title>
          <meta name="description" content="Completa la configurazione del tuo profilo LiveMoment" />
          <link rel="canonical" href={canonical} />
        </Helmet>
        <OnboardingModal 
          open={true} 
          onComplete={handleOnboardingComplete}
        />
      </>
    );
  }

  // Show loading while checking onboarding status or loading profile
  if (onboardingLoading || isProfileLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Profilo</title>
        <meta name="description" content="Gestisci identità, disponibilità, preferenze e notifiche del tuo profilo." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Profilo</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            console.log('Navigating to abbonamento...');
            navigate('/abbonamento');
          }}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          <Crown className="h-4 w-4" />
          Upgrade Profilo
        </Button>
      </div>

      {/* Galleria foto principale */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <PhotoGalleryCarousel
            photos={profile?.gallery || []}
            isOwnProfile={true}
            onPhotosUpdate={handlePhotosUpdate}
          />
        </CardContent>
      </Card>

      {/* Informazioni profilo */}
      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-brand text-white">
              {profile?.name?.slice(0, 2)?.toUpperCase() || 'LM'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-lg">{profile?.name || 'LiveMoment User'}</div>
            <div className="text-sm text-muted-foreground">
              @{profile?.username || 'username'}
            </div>
            {profile?.bio && (
              <div className="text-sm text-muted-foreground mt-1">{profile.bio}</div>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span><strong className="text-foreground">{profile?.followers_count || 0}</strong> follower</span>
              <span><strong className="text-foreground">{profile?.following_count || 0}</strong> seguiti</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowEditForm(true)}
            >
              Modifica
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowChatSettings(true)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-3 w-3" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disponibilità - spostata prima di social e galleria */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Disponibilità
            <Badge variant="outline" className="text-xs">
              {profile?.chat_permission === 'everyone' ? 'Pubblico' : 'Limitato'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Indica quando sei libero per uscire o partecipare a eventi.
            </p>
          </div>
          <AvailabilityForm />
          <div className="space-y-2">
            <div className="text-sm font-medium">I tuoi slot</div>
            <AvailabilityList />
          </div>
        </CardContent>
      </Card>

      {/* Informazioni personali e interessi */}
      {(profile?.mood || profile?.job_title || profile?.interests?.length > 0) && (
        <Card className="shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile?.mood && (
                <div>
                  <div className="text-sm font-medium">Mood</div>
                  <Badge variant="outline" className="mt-1">{profile.mood}</Badge>
                </div>
              )}
              {profile?.job_title && (
                <div>
                  <div className="text-sm font-medium">Lavoro</div>
                  <Badge variant="secondary" className="mt-1">{profile.job_title}</Badge>
                </div>
              )}
            </div>

            {profile?.interests && profile.interests.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Interessi</div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string) => (
                    <Badge key={interest} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="font-medium">Notifiche</div>
                <div className="text-sm text-muted-foreground">Inviti, chat, conferme</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      )}


      {/* Social links */}
      <Card className="shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Social</div>
            {profile?.instagram_username ? (
              <div className="flex items-center gap-2">
                <Input 
                  value={`@${profile.instagram_username}`} 
                  readOnly 
                  aria-label="Instagram username" 
                />
                <Button variant="secondary" size="sm">Collegato</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full">
                Collega Instagram
              </Button>
            )}
          </div>
        </CardContent>
      </Card>


      <FriendshipSystem />

      {/* Modals */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ProfileEditForm 
            onClose={() => {
              setShowEditForm(false);
              fetchProfile();
            }}
            profile={profile}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showChatSettings} onOpenChange={setShowChatSettings}>
        <DialogContent className="max-w-md">
          <ChatPermissionSettings
            currentPermission={profile?.chat_permission || 'everyone'}
            onUpdate={handleChatPermissionUpdate}
            onClose={() => setShowChatSettings(false)}
          />
        </DialogContent>
      </Dialog>

      <FriendSuggestionsModal
        open={showFriendSuggestions}
        onOpenChange={setShowFriendSuggestions}
      />

    </div>
  );
}
