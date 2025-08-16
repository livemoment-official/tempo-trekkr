import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NotificationBadgeProps {
  className?: string;
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { user } = useAuth();
  
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  });

  if (unreadCount === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className={`h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center ${className}`}
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </Badge>
  );
}