import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Users, Calendar } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import { useFriendRecommendations, useMomentRecommendations } from "@/hooks/useRecommendations";
import { useToast } from "@/hooks/use-toast";

export function RecommendationsSection() {
  const { toast } = useToast();
  const { 
    data: friendRecommendations = [], 
    isLoading: isLoadingFriends, 
    refetch: refetchFriends 
  } = useFriendRecommendations();
  
  const { 
    data: momentRecommendations = [], 
    isLoading: isLoadingMoments, 
    refetch: refetchMoments 
  } = useMomentRecommendations();

  const handleAction = async (id: string, type: 'friend' | 'moment') => {
    if (type === 'friend') {
      // Handle friend follow action
      toast({
        title: "Richiesta di amicizia inviata",
        description: "La richiesta è stata inviata con successo"
      });
    } else {
      // Handle moment join action
      toast({
        title: "Partecipazione confermata",
        description: "Ti sei unito al momento"
      });
    }
  };

  const handleRefresh = (type: 'friends' | 'moments') => {
    if (type === 'friends') {
      refetchFriends();
    } else {
      refetchMoments();
    }
    
    toast({
      title: "Aggiornamento raccomandazioni",
      description: "Le raccomandazioni sono state aggiornate"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Raccomandazioni per te</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users size={16} />
              Amici
            </TabsTrigger>
            <TabsTrigger value="moments" className="flex items-center gap-2">
              <Calendar size={16} />
              Momenti
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Persone che potresti conoscere</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRefresh('friends')}
                disabled={isLoadingFriends}
              >
                <RefreshCw size={14} className={isLoadingFriends ? "animate-spin" : ""} />
              </Button>
            </div>
            
            <div className="space-y-3">
              {isLoadingFriends ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : friendRecommendations.length > 0 ? (
                friendRecommendations.map(recommendation => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onAction={handleAction}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nessuna raccomandazione di amici al momento</p>
                  <p className="text-sm">Completa il tuo profilo per ottenere suggerimenti migliori</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="moments" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Momenti che potrebbero interessarti</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRefresh('moments')}
                disabled={isLoadingMoments}
              >
                <RefreshCw size={14} className={isLoadingMoments ? "animate-spin" : ""} />
              </Button>
            </div>
            
            <div className="space-y-3">
              {isLoadingMoments ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : momentRecommendations.length > 0 ? (
                momentRecommendations.map(recommendation => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onAction={handleAction}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nessuna raccomandazione di momenti al momento</p>
                  <p className="text-sm">Aggiorna i tuoi interessi per ottenere suggerimenti migliori</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}