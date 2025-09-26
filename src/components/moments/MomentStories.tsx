import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, Video, Play, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAuth } from "@/contexts/AuthContext";
interface MomentStoriesProps {
  momentId: string;
  canContribute: boolean;
}
interface Story {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
}
export function MomentStories({
  momentId,
  canContribute
}: MomentStoriesProps) {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    uploadGalleryImage,
    isUploading
  } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stories from database
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('moment_stories').select('*').eq('moment_id', momentId).order('created_at', {
          ascending: false
        });
        if (error) throw error;

        // Fetch user profiles for the stories
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(story => story.user_id))];
          const {
            data: profiles
          } = await supabase.from('profiles').select('id, name, avatar_url').in('id', userIds);
          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
          const formattedStories: Story[] = data.map(story => {
            const profile = profileMap.get(story.user_id);
            return {
              id: story.id,
              user_id: story.user_id,
              user_name: profile?.name || 'Utente',
              user_avatar: profile?.avatar_url,
              media_url: story.media_url,
              media_type: story.media_type as 'image' | 'video',
              created_at: formatTimeAgo(story.created_at)
            };
          });
          setStories(formattedStories);
        } else {
          setStories([]);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, [momentId]);
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Ora';
    if (diffInMinutes < 60) return `${diffInMinutes} min fa`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h fa`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}g fa`;
  };
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per aggiungere contenuti",
          variant: "destructive"
        });
        return;
      }
      const mediaUrl = await uploadGalleryImage(file);
      if (!mediaUrl) {
        throw new Error("Failed to upload media");
      }

      // Save story to database
      const {
        error
      } = await supabase.from('moment_stories').insert({
        moment_id: momentId,
        user_id: user.id,
        media_url: mediaUrl,
        media_type: file.type.startsWith('video/') ? 'video' : 'image'
      });
      if (error) throw error;

      // Add to local state immediately for instant UI update
      const newStory: Story = {
        id: Date.now().toString(),
        user_id: user.id,
        user_name: 'Tu',
        media_url: mediaUrl,
        media_type: file.type.startsWith('video/') ? 'video' : 'image',
        created_at: 'Ora'
      };
      setStories(prev => [newStory, ...prev]);
      toast({
        title: "Story aggiunta!",
        description: "Il tuo contenuto è stato condiviso con gli altri partecipanti"
      });
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del contenuto",
        variant: "destructive"
      });
    }
  };
  if (isLoading) {
    return <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-16 h-20 bg-muted animate-pulse rounded-lg" />
            <div className="w-16 h-20 bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Stories del momento
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!canContribute && <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Storie del momento</p>
                <p>Puoi vedere le stories del momento appena dichiari di partecipare</p>
              </div>
            </div>
          </div>}

        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Add Story Button */}
          {canContribute && <div className="flex-shrink-0">
              <button onClick={() => fileInputRef.current?.click()} className="w-16 h-20 border-2 border-dashed border-primary/25 rounded-lg flex flex-col items-center justify-center text-primary hover:bg-primary/5 transition-colors" disabled={isUploading}>
                {isUploading ? <div className="animate-spin w-4 h-4 border border-primary border-t-transparent rounded-full" /> : <>
                    <Plus className="h-5 w-5 mb-1" />
                    <span className="text-xs">Aggiungi</span>
                  </>}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
            </div>}

          {/* Stories */}
          {stories.map(story => <div key={story.id} className="flex-shrink-0">
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border">
                {story.media_type === 'video' ? <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-primary" />
                  </div> : <img src={story.media_url} alt="Story" className="w-full h-full object-cover" />}
                
                {/* User Avatar */}
                <div className="absolute -bottom-1 -right-1">
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={story.user_avatar} />
                    <AvatarFallback className="text-xs">
                      {story.user_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div className="text-center mt-1">
                <p className="text-xs text-muted-foreground truncate w-16">
                  {story.user_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {story.created_at}
                </p>
              </div>
            </div>)}
        </div>

        {stories.length === 0 && !canContribute}

        {stories.length === 0 && canContribute && <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Sii il primo a condividere una story!</p>
            <p className="text-xs mt-1">Presentati agli altri partecipanti</p>
          </div>}
      </CardContent>
    </Card>;
}