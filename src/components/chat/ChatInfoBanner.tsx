import { MapPin, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ShareModal } from "@/components/shared/ShareModal";

interface ChatInfoBannerProps {
  type: 'moment' | 'group' | 'event';
  contentId: string;
  contentTitle: string;
  location?: {
    name: string;
    address?: string;
  };
  when?: string;
  participantCount: number;
  onShowParticipants: () => void;
  category?: string;
}

export function ChatInfoBanner({
  type,
  contentId,
  contentTitle,
  location,
  when,
  participantCount,
  onShowParticipants,
  category
}: ChatInfoBannerProps) {
  return (
    <div className="p-3 bg-card/50 border-b border-border/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 text-sm">
            {/* Location */}
            {location?.name && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{location.name}</span>
              </div>
            )}
            
            {/* Date/Time */}
            {when && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {format(new Date(when), "d MMM 'alle' HH:mm", { locale: it })}
                </span>
              </div>
            )}
            
            {/* Category for groups */}
            {category && type === 'group' && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="px-2 py-1 text-xs bg-secondary rounded-full">
                  {category}
                </span>
              </div>
            )}
            
            {/* Participants */}
            <button
              onClick={onShowParticipants}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Users className="h-3 w-3 flex-shrink-0" />
              <span>{participantCount} {participantCount === 1 ? 'membro' : 'membri'}</span>
            </button>
          </div>
        </div>
        
        {/* Share Button */}
        <ShareModal contentType={type} contentId={contentId} title={contentTitle}>
          <button className="px-3 py-1.5 bg-background text-foreground text-sm rounded-md shadow-sm hover:shadow-md transition-shadow border border-border/50 hover:border-border">
            Condividi
          </button>
        </ShareModal>
      </div>
    </div>
  );
}