import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProfileTypeSelector } from '@/components/profiles/ProfileTypeSelector';
import { CreateArtistProfile } from '@/components/profiles/CreateArtistProfile';
import { CreateVenueProfile } from '@/components/profiles/CreateVenueProfile';
import { CreateStaffProfile } from '@/components/profiles/CreateStaffProfile';
import { useUserProfiles, type ProfileType } from '@/hooks/useUserProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Music, MapPin, Users, Edit, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Profili() {
  const { isAuthenticated } = useAuth();
  const {
    profiles,
    loading,
    createArtistProfile,
    createVenueProfile,
    createStaffProfile,
    deleteProfile,
    getTotalProfilesCount
  } = useUserProfiles();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createType, setCreateType] = useState<ProfileType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canonical = `${window.location.origin}/profili`;

  if (!isAuthenticated) {
    return <AuthGuard>Accedi per gestire i tuoi profili</AuthGuard>;
  }

  const handleCreateProfile = (type: ProfileType) => {
    setCreateType(type);
    setShowCreateForm(true);
  };

  const handleCreateSubmit = async (type: ProfileType, data: any) => {
    setActionLoading(true);
    try {
      switch (type) {
        case 'artist':
          await createArtistProfile(data);
          break;
        case 'venue':
          await createVenueProfile(data);
          break;
        case 'staff':
          await createStaffProfile(data);
          break;
      }
      setShowCreateForm(false);
      setCreateType(null);
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfile = async (type: ProfileType, id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo profilo?')) {
      await deleteProfile(type, id);
    }
  };

  const renderProfileCard = (profile: any, type: ProfileType, icon: any, title: string, color: string) => {
    const Icon = icon;
    
    return (
      <Card key={profile.id} className="relative">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>
              <Icon className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              {profile.verified && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={color}>
                <Icon className="h-3 w-3 mr-1" />
                {title}
              </Badge>
              {type === 'staff' && profile.role && (
                <Badge variant="outline">{profile.role}</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDeleteProfile(type, profile.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {profile.bio && (
            <p className="text-sm text-muted-foreground mb-3">{profile.bio}</p>
          )}
          
          {/* Type-specific content */}
          {type === 'artist' && profile.genres && profile.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.genres.slice(0, 3).map((genre: string) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {profile.genres.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.genres.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {type === 'venue' && (
            <div className="space-y-2">
              {profile.capacity && (
                <p className="text-sm">Capienza: <span className="font-medium">{profile.capacity} persone</span></p>
              )}
              {profile.amenities && profile.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {profile.amenities.slice(0, 3).map((amenity: string) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {profile.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.amenities.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
          
          {type === 'staff' && (
            <div className="space-y-2">
              {profile.experience_years && (
                <p className="text-sm">Esperienza: <span className="font-medium">{profile.experience_years} anni</span></p>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {profile.skills.slice(0, 3).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (showCreateForm && createType) {
    switch (createType) {
      case 'artist':
        return (
          <CreateArtistProfile
            onSubmit={(data) => handleCreateSubmit('artist', data)}
            onCancel={() => {
              setShowCreateForm(false);
              setCreateType(null);
            }}
            loading={actionLoading}
          />
        );
      case 'venue':
        return (
          <CreateVenueProfile
            onSubmit={(data) => handleCreateSubmit('venue', data)}
            onCancel={() => {
              setShowCreateForm(false);
              setCreateType(null);
            }}
            loading={actionLoading}
          />
        );
      case 'staff':
        return (
          <CreateStaffProfile
            onSubmit={(data) => handleCreateSubmit('staff', data)}
            onCancel={() => {
              setShowCreateForm(false);
              setCreateType(null);
            }}
            loading={actionLoading}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · I Tuoi Profili</title>
        <meta name="description" content="Gestisci i tuoi profili artista, location e staff su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <main className="container py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">I Tuoi Profili</h1>
              <p className="text-muted-foreground mt-2">
                Gestisci i tuoi profili professionali per artisti, location e staff
              </p>
            </div>
            
            {getTotalProfilesCount() > 0 && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Profilo
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : getTotalProfilesCount() === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Nessun profilo ancora</h2>
                <p className="text-muted-foreground mb-6">
                  Crea il tuo primo profilo per iniziare a offrirti come artista, location o staff
                </p>
              </div>
              
              <ProfileTypeSelector onSelectType={handleCreateProfile} />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Artists */}
              {profiles.artists.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Profili Artista ({profiles.artists.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profiles.artists.map(profile => 
                      renderProfileCard(profile, 'artist', Music, 'Artista', 'text-primary')
                    )}
                  </div>
                </section>
              )}

              {/* Venues */}
              {profiles.venues.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Profili Location ({profiles.venues.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profiles.venues.map(profile => 
                      renderProfileCard(profile, 'venue', MapPin, 'Location', 'text-secondary-foreground')
                    )}
                  </div>
                </section>
              )}

              {/* Staff */}
              {profiles.staff.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Profili Staff ({profiles.staff.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profiles.staff.map(profile => 
                      renderProfileCard(profile, 'staff', Users, 'Staff', 'text-accent-foreground')
                    )}
                  </div>
                </section>
              )}

              {/* Add new profile section */}
              <section className="border-t pt-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-4">Aggiungi un nuovo profilo</h3>
                  <ProfileTypeSelector onSelectType={handleCreateProfile} />
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}