/**
 * Calculate the temporal status of an event based on start and end times
 */
export type EventStatus = 'starting_soon' | 'in_progress' | 'ending_soon' | 'upcoming' | 'ended';

export interface EventStatusInfo {
  status: EventStatus;
  label: string;
  className: string;
  icon: string;
  iconColor: string;
}

export function getEventStatus(when_at?: string, end_at?: string): EventStatusInfo | null {
  if (!when_at) return null;

  const now = new Date();
  const startTime = new Date(when_at);
  const endTime = end_at ? new Date(end_at) : null;

  // Event has ended
  if (endTime && endTime < now) {
    return {
      status: 'ended',
      label: 'Terminato',
      className: 'bg-black/60 backdrop-blur-md text-white border border-white/20',
      icon: '✓',
      iconColor: 'text-gray-400'
    };
  }

  // Event has started
  if (startTime <= now) {
    // Event is ending soon (less than 1 hour remaining)
    if (endTime) {
      const hoursRemaining = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursRemaining < 1 && hoursRemaining > 0) {
        return {
          status: 'ending_soon',
          label: 'Sta terminando',
          className: 'bg-black/60 backdrop-blur-md text-white border border-white/20',
          icon: '⚡',
          iconColor: 'text-yellow-400'
        };
      }
    }

  // Event is in progress
  return {
    status: 'in_progress',
    label: 'In corso',
    className: 'bg-black/60 backdrop-blur-md text-white border border-white/20',
    icon: '🔴',
    iconColor: 'text-red-500'
  };
  }

  // Event starts soon (less than 30 minutes)
  const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);
  if (minutesUntilStart < 30 && minutesUntilStart > 0) {
    return {
      status: 'starting_soon',
      label: 'Inizia tra poco',
      className: 'bg-black/60 backdrop-blur-md text-white border border-white/20',
      icon: '⏰',
      iconColor: 'text-yellow-400'
    };
  }

  // Upcoming event
  return {
    status: 'upcoming',
    label: 'Prossimamente',
    className: 'bg-black/60 backdrop-blur-md text-white border border-white/20',
    icon: '📅',
    iconColor: 'text-blue-400'
  };
}

/**
 * Check if an event should be displayed (not ended)
 */
export function shouldDisplayEvent(when_at?: string, end_at?: string): boolean {
  if (!when_at) return true; // Show events without dates
  
  const now = new Date();
  const endTime = end_at ? new Date(end_at) : null;
  
  // Don't show ended events
  if (endTime && endTime < now) {
    return false;
  }
  
  return true;
}
