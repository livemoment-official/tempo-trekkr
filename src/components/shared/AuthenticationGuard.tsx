import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogIn } from "lucide-react";

interface AuthenticationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  action?: string;
}

export function AuthenticationGuard({ children, fallback, action = "eseguire questa azione" }: AuthenticationGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowFallback(true);
    } else {
      setShowFallback(false);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showFallback && !isAuthenticated) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border border-dashed">
          <AlertTriangle className="h-8 w-8 text-warning mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Accesso richiesto</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Devi effettuare il login per {action}
          </p>
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Accedi
          </Button>
        </div>
      )
    );
  }

  return <>{children}</>;
}