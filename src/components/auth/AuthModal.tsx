import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, Apple, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

type AuthStep = 'mode-selection' | 'login' | 'signup' | 'forgot-password';

export function AuthModal({ open, onOpenChange, title = "Benvenuto in LiveMoment", description = "Accedi al tuo account o creane uno nuovo" }: AuthModalProps) {
  const { signInWithGoogle, signInWithApple, signUp, signIn, resetPassword } = useAuth();
  const [step, setStep] = useState<AuthStep>('mode-selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // Don't close modal here, let the auth state change handle it
    } catch (error) {
      toast.error('Errore durante l\'accesso con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithApple();
      // Don't close modal here, let the auth state change handle it
    } catch (error) {
      toast.error('Errore durante l\'accesso con Apple');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Inserisci email e password');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.includes('Invalid login credentials')) {
          toast.error('Email o password non corretti');
        } else {
          toast.error(error);
        }
      } else {
        toast.success('Accesso effettuato!');
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      toast.error('Errore durante l\'accesso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error('Compila tutti i campi');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    if (password.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.includes('User already registered')) {
          toast.error('Utente già registrato. Prova ad accedere.');
        } else {
          toast.error(error);
        }
      } else {
        toast.success('Account creato! Puoi ora accedere');
        setStep('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error('Errore durante la registrazione');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Inserisci la tua email');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Link per il reset password inviato alla tua email');
        setStep('login');
      }
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'email');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('mode-selection');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {title}
          </DialogTitle>
          {description && (
            <p className="text-center text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'mode-selection' && (
            <>
              {/* Social Auth Options */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full h-12 bg-white text-black border border-border hover:bg-gray-50"
                >
                  <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    className="w-5 h-5 mr-3" 
                  />
                  Continua con Google
                </Button>

                <Button
                  onClick={handleAppleAuth}
                  disabled={isLoading}
                  className="w-full h-12 bg-black text-white hover:bg-gray-900"
                >
                  <Apple className="w-5 h-5 mr-3" />
                  Continua con Apple
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">oppure</span>
                </div>
              </div>

              {/* Email/Password Options */}
              <div className="space-y-3">
                <Button
                  onClick={() => setStep('login')}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Accedi con Email
                </Button>

                <Button
                  onClick={() => setStep('signup')}
                  className="w-full h-12"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Crea Account
                </Button>
              </div>
            </>
          )}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="la-tua-email@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="La tua password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? 'Accesso in corso...' : 'Accedi'}
              </Button>

              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setStep('forgot-password')}
                  className="text-sm"
                >
                  Password dimenticata?
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('mode-selection')}
                  className="w-full"
                >
                  ← Torna indietro
                </Button>
              </div>
            </form>
          )}

          {step === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="la-tua-email@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimo 6 caratteri"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Conferma Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ripeti la password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? 'Creazione account...' : 'Crea Account'}
              </Button>

              <div className="flex flex-col space-y-2">
                <p className="text-sm text-center text-muted-foreground">
                  Hai già un account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setStep('login')}
                    className="p-0 h-auto font-medium"
                  >
                    Accedi qui
                  </Button>
                </p>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('mode-selection')}
                  className="w-full"
                >
                  ← Torna indietro
                </Button>
              </div>
            </form>
          )}

          {step === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="font-medium">Recupera la tua password</h3>
                <p className="text-sm text-muted-foreground">
                  Inserisci la tua email e ti invieremo un link per reimpostare la password
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="la-tua-email@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? 'Invio...' : 'Invia Link di Reset'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('login')}
                className="w-full"
              >
                ← Torna al login
              </Button>
            </form>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground">
          Continuando accetti i nostri{' '}
          <span className="underline">Termini di Servizio</span> e{' '}
          <span className="underline">Privacy Policy</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}