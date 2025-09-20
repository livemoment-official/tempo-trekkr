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
import { AvailabilityToggle } from "@/components/profile/AvailabilityToggle";
import { FriendRequestsModal } from "@/components/profile/FriendRequestsModal";
import { useFriendship } from "@/hooks/useFriendship";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { OnboardingModal } from "@/components/profile/OnboardingModal";
import { FriendshipSystem } from "@/components/friendship/FriendshipSystem";
import { EnhancedPhotoGallery } from "@/components/profile/EnhancedPhotoGallery";
import { ChatPermissionSettings } from "@/components/profile/ChatPermissionSettings";
import { FriendSuggestionsModal } from "@/components/profile/FriendSuggestionsModal";
import { ProfileProgressIndicator } from "@/components/profile/ProfileProgressIndicator";
import { QuickEditField } from "@/components/profile/QuickEditField";
import { CollapsibleSection } from "@/components/profile/CollapsibleSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { useProfileMetrics } from "@/hooks/useProfileMetrics";
import { ProfileTypeSelector } from "@/components/profiles/ProfileTypeSelector";
import { Crown, Settings, MessageCircle, User, Camera, Heart, Users, Sparkles, Clock, UserPlus, Calendar, UserCheck, Music, MapPin, Bell, Globe, HelpCircle, BookOpen, ChevronRight, Trophy } from "lucide-react";
export default function Profilo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showFriendSuggestions, setShowFriendSuggestions] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/profilo";
  
  const { 
    isOnboardingRequired, 
    isLoading: onboardingLoading, 
    markOnboardingComplete,
    incrementRedirectCounter 
  } = useOnboardingState();

  const { metrics } = useProfileMetrics();
  const { pendingRequests } = useFriendship();

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

  const handleFieldUpdate = (fieldKey: string, value: string) => {
    setProfile({ ...profile, [fieldKey]: value });
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
    <div className="space-y-6">
      <Helmet>
        <title>LiveMoment · Profilo</title>
        <meta name="description" content="Gestisci identità, disponibilità, preferenze e notifiche del tuo profilo." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Profilo</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/abbonamento')}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          <Crown className="h-4 w-4" />
          Upgrade Profilo
        </Button>
      </div>

      {/* Enhanced Profile Header */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 avatar-ring">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-brand text-white text-lg">
                  {profile?.name?.slice(0, 2)?.toUpperCase() || 'LM'}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-xl">{profile?.name || 'LiveMoment User'}</div>
                  <div className="text-sm text-muted-foreground">
                    @{profile?.username || 'username'}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                  className="shrink-0"
                >
                  Modifica
                </Button>
              </div>
              
              {/* Status badges */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
                  Online
                </Badge>
                {profile?.mood && (
                  <Badge variant="outline">
                    {profile.mood}
                  </Badge>
                )}
              </div>
              
              {profile?.bio && (
                <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {profile.bio}
                </div>
              )}
              
              {profile?.job_title && (
                <div className="text-sm font-medium mb-2">
                  {profile.job_title}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card 
          className="shadow-card hover:shadow-elevated transition-smooth cursor-pointer"
          onClick={() => setShowFriendRequests(true)}
        >
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10 relative">
                <UserPlus className="h-5 w-5 text-primary" />
                {pendingRequests.length > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </div>
                )}
              </div>
              <div className="font-bold text-2xl">
                {metrics.loading ? '-' : metrics.friendsCount}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Amici</div>
              {pendingRequests.length > 0 && (
                <div className="text-xs text-red-600 font-medium">
                  {pendingRequests.length} richieste
                </div>
              )}
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
                {metrics.loading ? '-' : metrics.eventsCount}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Eventi</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-smooth">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-full bg-accent/10">
                <UserCheck className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="font-bold text-2xl">
                {metrics.loading ? '-' : metrics.peopleMet}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Persone</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disponibilità & Connessioni - Priorità Alta */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Disponibilità & Connessioni</h2>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Gestione Disponibilità */}
          <AvailabilityToggle />
        </div>
      </div>

      {/* Account Professionali */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Account Professionali</h2>
        
        <Card className="shadow-card hover:shadow-sm transition-smooth">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Espandi il tuo profilo con account professionali per artisti, location e staff
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => navigate('/profili')}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Profilo Artista</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>

                <button 
                  onClick={() => navigate('/profili')}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-secondary-foreground" />
                    <span className="text-sm font-medium">Profilo Location</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>

                <button 
                  onClick={() => navigate('/profili')}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-accent-foreground" />
                    <span className="text-sm font-medium">Profilo Staff</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferenze & Impostazioni */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Preferenze</h2>
        
        <div className="space-y-2">

          {/* Other preferences */}
          <Card 
            className="shadow-card hover:shadow-sm transition-smooth cursor-pointer"
            onClick={() => setShowChatSettings(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Chat e messaggi</span>
                    <div className="text-xs text-muted-foreground">
                      {profile?.chat_permission === 'everyone' ? 'Tutti possono scriverti' : 'Solo amici possono scriverti'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-sm transition-smooth cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Posizione</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-sm transition-smooth cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Lingua</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-sm transition-smooth cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Notifiche</span>
                    <div className="text-xs text-muted-foreground">Inviti, chat, conferme</div>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risorse Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Risorse</h2>
        
        <div className="space-y-2">
          <Card className="shadow-card hover:shadow-sm transition-smooth cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Centro assistenza</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-sm transition-smooth cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Guida all'app</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-card hover:shadow-sm transition-smooth cursor-pointer"
            onClick={() => navigate('/premi')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium">🏆 Premi</span>
                    <div className="text-xs text-muted-foreground">Guadagna punti e sblocca ricompense</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collapsible sections for advanced features */}
      <div className="space-y-4">
        <CollapsibleSection
          title="Galleria Foto"
          icon={<Camera className="h-4 w-4" />}
          badge={profile?.gallery?.length ? `${profile.gallery.length} foto` : "Vuota"}
          badgeVariant={profile?.gallery?.length ? "secondary" : "outline"}
          defaultOpen={false}
        >
          <EnhancedPhotoGallery
            photos={profile?.gallery || []}
            isOwnProfile={true}
            onPhotosUpdate={handlePhotosUpdate}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Disponibilità"
          icon={<Clock className="h-4 w-4" />}
          badge="Gestisci"
          badgeVariant="outline"
          defaultOpen={false}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Indica quando sei libero per uscire o partecipare a eventi.
            </p>
            <AvailabilityForm />
            <div className="space-y-2">
              <div className="text-sm font-medium">I tuoi slot</div>
              <AvailabilityList />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Amicizie & Connessioni"
          icon={<Users className="h-4 w-4" />}
          badge="Gestisci"
          badgeVariant="outline"
          defaultOpen={false}
        >
          <FriendshipSystem />
        </CollapsibleSection>
      </div>

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

      <FriendRequestsModal 
        open={showFriendRequests}
        onOpenChange={setShowFriendRequests}
      />

    </div>
  );
}
