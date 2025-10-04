import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import moment from "moment";
import "moment/locale/it";
import { Calendar as CalendarIcon, Plus, Bell, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AvailabilityForm } from "@/components/availability/AvailabilityForm";
import { AvailabilityList } from "@/components/availability/AvailabilityList";
import { useMyAvailability } from "@/hooks/useAvailability";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { NotificationPermissionCard } from "@/components/notifications/NotificationPermissionCard";

// Setup per react-big-calendar
moment.locale("it");
const localizer = momentLocalizer(moment);

// Componente per le notifiche
const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  type NotificationWithSender = {
    id: string;
    user_id: string;
    title: string;
    message: string;
    data: any;
    read: boolean;
    created_at: string;
    type: string;
    sender?: {
      id: string;
      name: string;
      avatar_url: string;
    };
  };
  
  const { data: notificationsWithUsers = [] } = useQuery<NotificationWithSender[]>({
    queryKey: ['notifications-with-users', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: notifs, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Fetch user data for each notification
      const userIds = notifs
        ?.map(n => {
          const data = n.data as any;
          return data?.user_id;
        })
        .filter(Boolean) || [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);
        
        return notifs.map(notif => {
          const data = notif.data as any;
          return {
            ...notif,
            sender: profiles?.find(p => p.id === data?.user_id)
          } as NotificationWithSender;
        });
      }
      
      return notifs as NotificationWithSender[];
    },
    enabled: !!user?.id
  });

  const unreadCount = notificationsWithUsers.filter(n => !n.read).length;

  const handleNotificationClick = async (notification: NotificationWithSender) => {
    // Mark as read
    if (!notification.read) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
    }

    // Navigate to related content
    const data = notification.data as any;
    if (data?.moment_id) {
      navigate(`/moment/${data.moment_id}`);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifiche
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 rounded-full px-2 text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notificationsWithUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuna notifica</p>
        ) : (
          notificationsWithUsers.slice(0, 5).map(notification => (
            <div 
              key={notification.id} 
              className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/70 transition-colors ${
                !notification.read ? 'bg-accent/50' : 'bg-muted/30'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                {notification.sender && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={notification.sender.avatar_url} />
                    <AvatarFallback>
                      {notification.sender.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">
                    {notification.sender ? 
                      `${notification.sender.name} ${notification.message.toLowerCase().replace('qualcuno', '').replace('ti ha', 'ha')}` :
                      notification.message
                    }
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), "dd MMM, HH:mm", { locale: it })}
                  </span>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1 shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

// Componente per la lista degli impegni
const UpcomingEvents = () => {
  const {
    user
  } = useAuth();
  const {
    data: events = []
  } = useQuery({
    queryKey: ['upcoming-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch momenti, eventi e inviti dell'utente
      const [momentsRes, eventsRes, invitesRes] = await Promise.all([supabase.from('moments').select('*').or(`host_id.eq.${user.id},participants.cs.{${user.id}}`).gte('when_at', new Date().toISOString()).order('when_at', {
        ascending: true
      }), supabase.from('events').select('*').eq('host_id', user.id).gte('when_at', new Date().toISOString()).order('when_at', {
        ascending: true
      }), supabase.from('invites').select('*').or(`host_id.eq.${user.id},participants.cs.{${user.id}}`).gte('when_at', new Date().toISOString()).order('when_at', {
        ascending: true
      })]);
      const allEvents = [...(momentsRes.data || []).map(m => ({
        ...m,
        type: 'momento'
      })), ...(eventsRes.data || []).map(e => ({
        ...e,
        type: 'evento'
      })), ...(invitesRes.data || []).map(i => ({
        ...i,
        type: 'invito'
      }))].sort((a, b) => new Date(a.when_at).getTime() - new Date(b.when_at).getTime());
      return allEvents;
    },
    enabled: !!user?.id
  });
  const navigate = useNavigate();
  return <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Prossimi Impegni
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? <p className="text-sm text-muted-foreground">Nessun impegno in programma</p> : events.slice(0, 5).map(event => <div key={`${event.type}-${event.id}`} className="p-3 rounded-lg border bg-card hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <Badge variant="outline" className="h-5 px-2 text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  {event.when_at && <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.when_at), "dd MMM, HH:mm", {
                locale: it
              })}
                    </p>}
                  {event.place && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {typeof event.place === 'object' && event.place && !Array.isArray(event.place) ? (event.place as any).address || (event.place as any).name || 'Luogo specificato' : String(event.place)}
                    </p>}
                </div>
              </div>
            </div>)}
        {events.length > 5 && <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/momenti')}>
            Vedi tutti gli impegni
          </Button>}
      </CardContent>
    </Card>;
};
export default function Agenda() {
  const {
    isAuthenticated,
    user
  } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {
    data: availability = []
  } = useMyAvailability(user?.id);

  // Prepara gli eventi per il calendario
  const calendarEvents = availability.map(avail => ({
    id: avail.id,
    title: `Disponibile`,
    start: new Date(avail.start_at),
    end: avail.end_at ? new Date(avail.end_at) : new Date(new Date(avail.start_at).getTime() + 60 * 60 * 1000),
    resource: avail
  }));
  if (!isAuthenticated) {
    return <AuthGuard title="Accedi per vedere la tua agenda" description="Devi essere autenticato per gestire la tua agenda e le tue disponibilità">
        <div />
      </AuthGuard>;
  }
  return <>
      <Helmet>
        <title>Agenda - LiveMoment</title>
        <meta name="description" content="Gestisci la tua agenda, disponibilità e impegni su LiveMoment" />
        <link rel="canonical" href={`${window.location.origin}/agenda`} />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            
            
          </div>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="notifications">Notifiche</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <UpcomingEvents />
            
            
          </TabsContent>


          <TabsContent value="notifications" className="space-y-4">
            <NotificationPermissionCard />
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </>;
}