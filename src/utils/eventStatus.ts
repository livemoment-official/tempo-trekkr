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
      className: 'bg-gray-400/80 backdrop-blur-md text-black border border-gray-500/30',
      icon: '✓',
      iconColor: 'text-gray-700'
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
          className: 'bg-red-400/80 backdrop-blur-md text-black border border-red-500/30',
          icon: '⚡',
          iconColor: 'text-red-700'
        };
      }
    }

  // Event is in progress
  return {
    status: 'in_progress',
    label: 'In corso',
    className: 'bg-white/90 text-gray-700 border border-gray-200',
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
      className: 'bg-gradient-to-r from-amber-300/90 via-yellow-400/90 to-amber-400/90 backdrop-blur-md text-black border border-yellow-500/30',
      icon: '⏰',
      iconColor: 'text-yellow-700'
    };
  }

  // Upcoming event
  return {
    status: 'upcoming',
    label: 'Prossimamente',
    className: 'bg-white/90 text-blue-700 border border-blue-200',
    icon: '📅',
    iconColor: 'text-blue-600'
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
