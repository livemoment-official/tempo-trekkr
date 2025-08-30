import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin, RefreshCw } from "lucide-react";
import { useRealTimePresence } from "@/hooks/useRealTimePresence";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export function OnlineUsersWidget() {
  const { nearbyUsers, isOnline, loadNearbyUsers } = useRealTimePresence();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            Persone vicine
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadNearbyUsers}
            className="p-1"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {nearbyUsers.length > 0 ? (
          nearbyUsers.slice(0, 5).map((userPresence) => (
            <div key={userPresence.user_id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={userPresence.user?.avatar_url} />
                  <AvatarFallback>
                    {userPresence.user?.name?.[0] || userPresence.user?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {userPresence.user?.name || userPresence.user?.username || 'Utente'}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {userPresence.status && (
                    <span className="truncate">{userPresence.status}</span>
                  )}
                  
                  {userPresence.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={10} />
                      <span>Vicino</span>
                    </div>
                  )}
                  
                  <span>
                    {formatDistanceToNow(new Date(userPresence.last_seen), {
                      addSuffix: true,
                      locale: it
                    })}
                  </span>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="p-2">
                <MessageCircle size={14} />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <p className="text-sm">Nessuno online nelle vicinanze</p>
            <p className="text-xs">Abilita la geolocalizzazione per vedere le persone vicine</p>
          </div>
        )}
        
        {nearbyUsers.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-xs">
              Mostra altri {nearbyUsers.length - 5}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}