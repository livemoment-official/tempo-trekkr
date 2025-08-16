import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithOtp: (identifier: string) => Promise<{ error?: string }>;
  signInWithEmailOtp: (email: string) => Promise<{ error?: string }>;
  verifyOtp: (identifier: string, token: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Trigger profile creation for new signups
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            // Check if profile exists, create if not
            checkAndCreateProfile(session.user.id);
          }, 1000);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: '',
            username: `user_${userId.slice(0, 8)}`,
            onboarding_completed: false
          });
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error('Apple sign-in error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const signInWithOtp = async (identifier: string) => {
    // Check if it's an email or phone number
    const isEmail = identifier.includes('@');
    const isPhone = /^\+?\d[\d\s-()]+$/.test(identifier);
    
    if (isEmail) {
      // For emails, use magic link (default behavior)
      const { error } = await supabase.auth.signInWithOtp({
        email: identifier,
        options: {
          shouldCreateUser: true,
        },
      });
      
      // Handle captcha-related errors specifically
      if (error?.message?.includes('captcha')) {
        return { error: 'Verifica captcha richiesta. Contatta il supporto se il problema persiste.' };
      }
      
      return { error: error?.message };
    } else if (isPhone) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: identifier,
      });
      
      // Handle captcha-related errors specifically
      if (error?.message?.includes('captcha')) {
        return { error: 'Verifica captcha richiesta. Contatta il supporto se il problema persiste.' };
      }
      
      return { error: error?.message };
    } else {
      // Treat as username - we'll need to find the email/phone associated with it
      // For now, return an error asking for email or phone
      return { error: 'Inserisci email o numero di telefono per ricevere il codice' };
    }
  };

  const signInWithEmailOtp = async (email: string) => {
    // Use a workaround: set channel to 'email' explicitly and disable redirectTo
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          channel: 'email' // Force email channel
        }
      }
    });
    
    // Handle captcha-related errors specifically
    if (error?.message?.includes('captcha')) {
      return { error: 'Verifica captcha richiesta. Contatta il supporto se il problema persiste.' };
    }
    
    return { error: error?.message };
  };

  const verifyOtp = async (identifier: string, token: string) => {
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      const { error } = await supabase.auth.verifyOtp({
        email: identifier,
        token,
        type: 'email',
      });
      return { error: error?.message };
    } else {
      const { error } = await supabase.auth.verifyOtp({
        phone: identifier,
        token,
        type: 'sms',
      });
      return { error: error?.message };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      // Gestisce errori specifici per migliorare UX
      if (error) {
        if (error.message.includes('User already registered')) {
          return { error: 'Questo email è già registrato. Prova ad accedere.' };
        }
        if (error.message.includes('Error sending confirmation email')) {
          // Ignora errore di invio email ma permetti registrazione
          return { error: null };
        }
        return { error: error.message };
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      return { error: error?.message };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signInWithApple,
    signInWithOtp,
    signInWithEmailOtp,
    verifyOtp,
    signUp,
    signIn,
    resetPassword,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}