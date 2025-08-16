import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useOnboardingState() {
  const { user, isAuthenticated } = useAuth();
  const [isOnboardingRequired, setIsOnboardingRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectLoopCounter, setRedirectLoopCounter] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkOnboardingStatus();
    } else {
      setIsLoading(false);
      setIsOnboardingRequired(null);
    }
  }, [isAuthenticated, user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    // Prevent infinite loops
    if (redirectLoopCounter > 5) {
      console.warn('⚠️ Redirect loop detected, stopping onboarding check');
      setIsOnboardingRequired(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Checking onboarding status for user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingRequired(false);
      } else if (!profile) {
        console.log('📝 Profile not found, onboarding required');
        setIsOnboardingRequired(true);
      } else {
        const needsOnboarding = !profile.onboarding_completed;
        console.log('✅ Onboarding status:', needsOnboarding ? 'required' : 'completed');
        setIsOnboardingRequired(needsOnboarding);
      }
    } catch (error) {
      console.error('Exception checking onboarding status:', error);
      setIsOnboardingRequired(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markOnboardingComplete = () => {
    console.log('✅ Marking onboarding as complete');
    setIsOnboardingRequired(false);
    setRedirectLoopCounter(0);
  };

  const incrementRedirectCounter = () => {
    setRedirectLoopCounter(prev => prev + 1);
  };

  return {
    isOnboardingRequired,
    isLoading,
    checkOnboardingStatus,
    markOnboardingComplete,
    incrementRedirectCounter,
    redirectLoopCounter,
  };
}