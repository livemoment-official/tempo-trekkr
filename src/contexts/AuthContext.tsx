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
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Trigger profile creation for new signups
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, redirecting to profile page');
          setTimeout(() => {
            // Check if profile exists, create if not
            checkAndCreateProfile(session.user.id);
            // Redirect to profile page after login
            window.location.href = '/profilo';
          }, 500);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (userId: string) => {
    try {
      console.log('Checking profile for user:', userId);
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, onboarding_completed')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      if (!profile) {
        console.log('Creating new profile for user:', userId);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: '',
            username: `user_${userId.slice(0, 8)}`,
            onboarding_completed: false
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully');
        }
      } else {
        console.log('Profile exists:', profile);
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
      console.log('Attempting sign up for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profilo`
        }
      });
      
      console.log('Sign up response:', { data, error });
      
      // Gestisce errori specifici per migliorare UX
      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('User already registered')) {
          return { error: 'Questo email è già registrato. Prova ad accedere.' };
        }
        if (error.message.includes('Error sending confirmation email')) {
          // Se l'utente è stato creato ma l'email non è stata inviata, continua
          console.log('User created but email confirmation failed - continuing');
          return { error: null };
        }
        return { error: error.message };
      }
      
      // Se l'utente è stato creato con successo
      if (data.user) {
        console.log('User created successfully:', data.user.email);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in response:', { data, error });
      
      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Email o password non corretti. Verifica i dati inseriti.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Email non confermata. Controlla la tua casella di posta.' };
        }
        return { error: error.message };
      }
      
      if (data.user) {
        console.log('User signed in successfully:', data.user.email);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
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