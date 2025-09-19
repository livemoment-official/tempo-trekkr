import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, Video, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";

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

export function MomentStories({ momentId, canContribute }: MomentStoriesProps) {
  const { toast } = useToast();
  const { uploadGalleryImage, isUploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stories, setStories] = useState<Story[]>([
    // Mock stories for now
    {
      id: '1',
      user_id: 'user1',
      user_name: 'Marco',
      user_avatar: '',
      media_url: '/api/placeholder/300/400',
      media_type: 'image',
      created_at: '2 min fa'
    },
    {
      id: '2',
      user_id: 'user2',
      user_name: 'Sofia',
      user_avatar: '',
      media_url: '/api/placeholder/300/400',
      media_type: 'image',
      created_at: '5 min fa'
    }
  ]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
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

      // TODO: Save story to database
      // For now, just add to local state
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
        description: "Il tuo contenuto è stato condiviso"
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stories del Momento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Add Story Button */}
          {canContribute && (
            <div className="flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-20 border-2 border-dashed border-primary/25 rounded-lg flex flex-col items-center justify-center text-primary hover:bg-primary/5 transition-colors"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin w-4 h-4 border border-primary border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Plus className="h-5 w-5 mb-1" />
                    <span className="text-xs">Aggiungi</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Stories */}
          {stories.map((story) => (
            <div key={story.id} className="flex-shrink-0">
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border">
                {story.media_type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                ) : (
                  <img 
                    src={story.media_url} 
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                )}
                
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
            </div>
          ))}
        </div>

        {stories.length === 0 && !canContribute && (
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nessuna story ancora</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}