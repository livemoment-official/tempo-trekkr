import { useState } from 'react';

interface SubscriptionLimitConfig {
  messages?: number;
  events?: number;
  moments?: number;
}

const FREE_LIMITS: SubscriptionLimitConfig = {
  messages: 50,
  events: 5,
  moments: 10,
};

export function useSubscriptionLimit(isProUser: boolean = false) {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitType, setLimitType] = useState<"messages" | "events" | "moments" | "generic">("generic");
  const [currentCount, setCurrentCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);

  const checkLimit = (
    type: "messages" | "events" | "moments",
    currentUsage: number = 0
  ): boolean => {
    // Pro users have no limits
    if (isProUser) return true;

    const limit = FREE_LIMITS[type] || 0;

    // Check if limit reached
    if (currentUsage >= limit) {
      setLimitType(type);
      setCurrentCount(currentUsage);
      setMaxCount(limit);
      setShowLimitModal(true);
      return false;
    }

    return true;
  };

  const triggerLimitModal = (type: "messages" | "events" | "moments" | "generic") => {
    setLimitType(type);
    setShowLimitModal(true);
  };

  return {
    showLimitModal,
    setShowLimitModal,
    limitType,
    currentCount,
    maxCount,
    checkLimit,
    triggerLimitModal,
  };
}
