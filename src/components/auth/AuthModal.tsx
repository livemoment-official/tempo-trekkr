import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Smartphone, Apple } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

type AuthStep = 'providers' | 'otp-input' | 'otp-verify';

export function AuthModal({ open, onOpenChange, title = "Accedi a LiveMoment", description = "Scegli come vuoi accedere" }: AuthModalProps) {
  const { signInWithGoogle, signInWithApple, signInWithOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<AuthStep>('providers');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleOtpRequest = async () => {
    if (!identifier.trim()) {
      toast.error('Inserisci email o numero di telefono');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithOtp(identifier);
      if (error) {
        toast.error(error);
      } else {
        setStep('otp-verify');
        toast.success('Codice inviato! Controlla i tuoi messaggi');
      }
    } catch (error) {
      toast.error('Errore durante l\'invio del codice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otpCode.trim()) {
      toast.error('Inserisci il codice ricevuto');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyOtp(identifier, otpCode);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Accesso effettuato!');
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      toast.error('Codice non valido');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('providers');
    setIdentifier('');
    setOtpCode('');
    setIsLoading(false);
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
          {step === 'providers' && (
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

              {/* Email/Phone Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Email, telefono o @username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="h-12 pr-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleOtpRequest()}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {identifier.includes('@') ? (
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    ) : identifier.match(/^\+?\d/) ? (
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleOtpRequest}
                  disabled={isLoading || !identifier.trim()}
                  className="w-full h-12"
                >
                  {isLoading ? 'Invio...' : 'Invia codice'}
                </Button>
              </div>
            </>
          )}

          {step === 'otp-verify' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="font-medium">Codice inviato</div>
                    <div className="text-sm text-muted-foreground">
                      Controlla {identifier.includes('@') ? 'la tua email' : 'i tuoi messaggi'}
                    </div>
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {identifier}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Inserisci il codice a 6 cifre"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-12 text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleOtpVerify()}
                />

                <Button
                  onClick={handleOtpVerify}
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full h-12"
                >
                  {isLoading ? 'Verifico...' : 'Verifica e accedi'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep('providers')}
                  className="w-full"
                >
                  ← Torna indietro
                </Button>
              </div>
            </div>
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