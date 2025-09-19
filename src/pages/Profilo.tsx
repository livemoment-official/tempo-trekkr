import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { OnboardingModal } from "@/components/profile/OnboardingModal";
import { ChatPermissionSettings } from "@/components/profile/ChatPermissionSettings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { 
  Crown, 
  Settings, 
  MessageCircle, 
  User, 
  Camera, 
  Heart, 
  Users, 
  Sparkles, 
  Clock,
  ChefHat,
  UserCheck,
  Link2,
  MapPin,
  Globe,
  HelpCircle,
  BookOpen,
  Briefcase,
  Building2,
  Mic,
  ChevronRight,
  Bell
} from "lucide-react";
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

  // Mock data for metrics - in a real app, these would come from the database
  const userMetrics = {
    events: 12, // Eventi creati/partecipati
    connections: 47, // Persone incontrate
    meetings: 8 // Appuntamenti/incontri
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Helmet>
        <title>LiveMoment · Profilo</title>
        <meta name="description" content="Gestisci identità, disponibilità, preferenze e notifiche del tuo profilo." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profilo</h1>
      </div>

      {/* Profilo compatto */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
                {profile?.name?.slice(0, 2)?.toUpperCase() || 'LM'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile?.name || 'Gabriele'}</h2>
              <Button 
                variant="ghost" 
                className="h-auto p-0 text-muted-foreground hover:text-foreground text-left"
                onClick={() => setShowEditForm(true)}
              >
                Modifica profilo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metriche in evidenza */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">{userMetrics.events}</div>
            <div className="text-sm text-muted-foreground">Eventi</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{userMetrics.connections}</div>
            <div className="text-sm text-muted-foreground">Persone incontrate</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-pink-100 rounded-full flex items-center justify-center">
              <Link2 className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold">{userMetrics.meetings}</div>
            <div className="text-sm text-muted-foreground">Connessioni</div>
          </CardContent>
        </Card>
      </div>

      {/* Account Professionali */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Account Professionali</h3>
        
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-4 flex items-center gap-4 justify-start rounded-lg"
              onClick={() => navigate('/profili')}
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Mic className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Account Artista</div>
                <div className="text-sm text-muted-foreground">Crea il tuo profilo artista</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-4 flex items-center gap-4 justify-start rounded-lg"
              onClick={() => navigate('/profili')}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Account Location</div>
                <div className="text-sm text-muted-foreground">Gestisci la tua venue</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-4 flex items-center gap-4 justify-start rounded-lg"
              onClick={() => navigate('/profili')}
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Account Staff</div>
                <div className="text-sm text-muted-foreground">Profilo professionale</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preferenze */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Preferenze</h3>
        
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-4 flex items-center gap-4 justify-start rounded-lg"
              onClick={() => setShowChatSettings(true)}
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="font-medium">Impostazioni</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Posizione</div>
                <div className="text-sm text-muted-foreground">
                  Milano, Italia 🇮🇹
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Lingua dell'applicazione</div>
                <div className="text-sm text-muted-foreground">
                  Italiano 🇮🇹
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div className="font-medium">Notifiche</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-4 flex items-center gap-4 justify-start rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              onClick={() => navigate('/abbonamento')}
            >
              <Crown className="h-5 w-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">Upgrade Profilo</div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Risorse */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Risorse</h3>
        
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-4 flex items-center gap-4 justify-start rounded-lg"
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="font-medium">Centro assistenza</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full h-auto p-4 flex items-center gap-4 justify-start rounded-lg"
            >
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="font-medium">Guida</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
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

    </div>
  );
}
