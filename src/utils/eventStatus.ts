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
      className: 'bg-white/90 text-gray-700 border border-gray-300',
      icon: '✓',
      iconColor: 'text-gray-500'
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
          className: 'bg-white/90 text-red-700 border border-red-200',
          icon: '⚡',
          iconColor: 'text-red-600'
        };
      }
    }

    // Event is in progress
    return {
      status: 'in_progress',
      label: 'In corso',
      className: 'bg-white/90 text-orange-700 border border-orange-200',
      icon: '🔴',
      iconColor: 'text-orange-600'
    };
  }

  // Event starts soon (less than 30 minutes)
  const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);
  if (minutesUntilStart < 30 && minutesUntilStart > 0) {
    return {
      status: 'starting_soon',
      label: 'Inizia tra poco',
      className: 'bg-white/90 text-yellow-700 border border-yellow-200',
      icon: '⏰',
      iconColor: 'text-yellow-600'
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
