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
        console.log('🔄 Auth state changed:', {
          event,
          userId: session?.user?.id,
          email: session?.user?.email,
          emailConfirmed: session?.user?.email_confirmed_at,
          hasSession: !!session
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Trigger profile creation for new signups
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, checking profile and redirecting...');
          setTimeout(() => {
            // Check if profile exists, create if not
            ensureProfileExists(session.user.id, session.user.email || '');
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

  // Enhanced helper function to ensure profile exists with retry mechanism
  const ensureProfileExists = async (userId: string, email: string, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    try {
      console.log(`🔍 Checking profile for user ${userId} (attempt ${retryCount + 1})`);
      
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking profile:', checkError);
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying profile check in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return ensureProfileExists(userId, email, retryCount + 1);
        }
        return;
      }

      if (!existingProfile) {
        console.log('📝 Creating new profile for user:', userId);
        
        // Generate a more user-friendly username
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || `user_${userId.slice(0, 8)}`;
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              name: '',
              username,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (createError) {
          console.error('❌ Error creating profile:', createError);
          if (retryCount < maxRetries) {
            console.log(`🔄 Retrying profile creation in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return ensureProfileExists(userId, email, retryCount + 1);
          }
        } else {
          console.log('✅ Profile created successfully for user:', userId);
        }
      } else {
        console.log('✅ Profile already exists for user:', userId);
      }
    } catch (error) {
      console.error('💥 Exception in ensureProfileExists:', error);
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying due to exception in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return ensureProfileExists(userId, email, retryCount + 1);
      }
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
      console.log('🔄 Starting signup process for:', email);
      
      // Clean up any existing auth state first
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('✅ Cleaned up existing auth state');
      } catch (cleanupError) {
        console.log('⚠️ Cleanup error (expected):', cleanupError);
      }

      const redirectUrl = `${window.location.origin}/profilo`;
      console.log('🌐 Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('already registered')) {
          return { error: 'Questo email è già registrato. Prova ad accedere invece.' };
        }
        if (error.message.includes('invalid')) {
          return { error: 'Email o password non validi. Controlla i dati inseriti.' };
        }
        if (error.message.includes('Error sending confirmation email')) {
          console.log('User created but email confirmation failed - continuing with manual profile creation');
          // Try to create profile manually if user was created
          if (data?.user) {
            await ensureProfileExists(data.user.id, email);
          }
          return { error: null };
        }
        return { error: error.message };
      }

      console.log('✅ Signup successful! User data:', {
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmed: data.user?.email_confirmed_at,
        session: !!data.session
      });

      // Try to create profile with retry mechanism
      if (data.user) {
        await ensureProfileExists(data.user.id, email);
      }

      return { error: null };
    } catch (error: any) {
      console.error('💥 Signup failed with exception:', error);
      return { error: `Errore durante la registrazione: ${error.message}` };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Starting sign in process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Email o password non corretti. Verifica i tuoi dati o registrati se non hai ancora un account.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Email non confermata. Controlla la tua casella di posta.' };
        }
        return { error: `Errore di accesso: ${error.message}` };
      }

      console.log('✅ Sign in successful! User data:', {
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmed: data.user?.email_confirmed_at,
        session: !!data.session
      });

      // Ensure profile exists for existing users too
      if (data.user) {
        await ensureProfileExists(data.user.id, data.user.email || email);
      }

      return { error: null };
    } catch (error: any) {
      console.error('💥 Sign in failed with exception:', error);
      return { error: `Errore durante l'accesso: ${error.message}` };
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