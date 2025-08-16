import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/auth/AuthGuard";
export default function Profilo() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/profilo";

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, trigger onboarding
          setShowOnboarding(true);
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(data);
        // Check if onboarding is needed
        if (!data.onboarding_completed) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchProfile(); // Reload profile data
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

  if (isLoading) {
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

      <h1 className="text-lg font-semibold">Profilo</h1>

      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.name?.slice(0, 2)?.toUpperCase() || 'LM'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{profile?.name || 'LiveMoment User'}</div>
            <div className="text-sm text-muted-foreground">
              @{profile?.username || 'username'}
            </div>
            {profile?.bio && (
              <div className="text-sm text-muted-foreground mt-1">{profile.bio}</div>
            )}
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowEditForm(true)}
          >
            Modifica
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Disponibile oggi sera</div>
              <div className="text-sm text-muted-foreground">18:00 – 22:00</div>
            </div>
            <Switch />
          </div>

          {profile?.interests && profile.interests.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Interessi</div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string) => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Notifiche</div>
              <div className="text-sm text-muted-foreground">Inviti, chat, conferme</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {profile?.mood || profile?.job_title || profile?.relationship_status ? (
        <Card className="shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {profile?.mood && (
                <div>
                  <div className="text-sm font-medium">Mood</div>
                  <div className="text-sm text-muted-foreground">{profile.mood}</div>
                </div>
              )}
              {profile?.job_title && (
                <div>
                  <div className="text-sm font-medium">Lavoro</div>
                  <div className="text-sm text-muted-foreground">{profile.job_title}</div>
                </div>
              )}
              {profile?.relationship_status && (
                <div>
                  <div className="text-sm font-medium">Relazione</div>
                  <div className="text-sm text-muted-foreground">{profile.relationship_status}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {profile?.instagram_username && (
        <Card className="shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Social & Galleria</div>
              <div className="flex items-center gap-2">
                <Input 
                  value={`@${profile.instagram_username}`} 
                  readOnly 
                  aria-label="Instagram username" 
                />
                <Button variant="secondary" size="sm">Collegato</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="aspect-square rounded-md bg-muted" aria-label={`Slot immagine ${i}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Disponibilità</div>
            <p className="text-sm text-muted-foreground">Indica quando sei libero per uscire o partecipare a eventi. Se rendi la disponibilità visibile, potrà comparire nelle ricerche ed esplora.</p>
          </div>
          <AvailabilityForm />
          <div className="space-y-2">
            <div className="text-sm font-medium">I tuoi slot</div>
            <AvailabilityList />
          </div>
        </CardContent>
      </Card>

      <FriendshipSystem />

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

      <OnboardingModal 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
