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

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const signInWithApple = async () => {
    const redirectUrl = `${window.location.origin}/`;
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUrl,
      },
    });
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
      return { error: error?.message };
    } else if (isPhone) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: identifier,
      });
      return { error: error?.message };
    } else {
      // Treat as username - we'll need to find the email/phone associated with it
      // For now, return an error asking for email or phone
      return { error: 'Inserisci email o numero di telefono per ricevere il codice' };
    }
  };

  const signInWithEmailOtp = async (email: string) => {
    // Force OTP code for email instead of magic link by not setting emailRedirectTo
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: undefined, // This forces OTP code instead of magic link
      },
    });
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