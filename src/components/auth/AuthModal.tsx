import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

type AuthStep = 'email-login' | 'signup' | 'forgot-password';

export function AuthModal({ open, onOpenChange, title = "Benvenuto su LiveMoment", description = "Per favore accedi o registrati qui sotto." }: AuthModalProps) {
  const { signInWithGoogle, signUp, signIn, resetPassword } = useAuth();
  const [step, setStep] = useState<AuthStep>('email-login');
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
          toast.error('Questo email è già registrato. Prova ad accedere.');
        } else {
          toast.error(error);
        }
      } else {
        toast.success('Account creato! Accesso in corso...');
        onOpenChange(false);
        resetForm();
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
        setStep('email-login');
      }
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'email');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email-login');
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
      <DialogContent className="sm:max-w-md border-0 bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <p className="text-center text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 'email-login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>

              {password && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="La tua password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background border-border"
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
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-white text-black hover:bg-gray-100"
              >
                {isLoading ? 'Caricamento...' : 'Continua con l\'email'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">oppure</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 bg-white border-border text-black hover:bg-gray-50"
              >
                <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google" 
                  className="w-4 h-4 mr-3" 
                />
                Accedi con Google
              </Button>

              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setStep('forgot-password')}
                  className="text-sm text-muted-foreground hover:text-foreground p-0"
                >
                  Password dimenticata?
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('signup')}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Crea Account
                  </button>
                </div>
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
                  placeholder="email@esempio.com"
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
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('email-login')}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Hai già un account? Accedi qui
                  </button>
                </div>
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
                  placeholder="email@esempio.com"
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
                onClick={() => setStep('email-login')}
                className="w-full"
              >
                ← Torna al login
              </Button>
            </form>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground pt-4">
          Continuando accetti i nostri{' '}
          <span className="underline cursor-pointer hover:text-foreground">Termini di Servizio</span> e{' '}
          <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
