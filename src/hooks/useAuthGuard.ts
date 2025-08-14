import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthGuard() {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const requireAuth = (callback?: () => void, options?: { title?: string; description?: string }) => {
    if (isAuthenticated) {
      callback?.();
      return true;
    } else {
      setShowAuthModal(true);
      return false;
    }
  };

  const closeAuthModal = () => setShowAuthModal(false);

  return {
    isAuthenticated,
    showAuthModal,
    requireAuth,
    closeAuthModal,
    setShowAuthModal,
  };
}