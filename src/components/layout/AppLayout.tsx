import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessageSquareText, MapPin, Search as SearchIcon, Plus, Calendar, User, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { GuestBanner } from "@/components/auth/GuestBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { UnconfirmedUserBanner } from "@/components/auth/UnconfirmedUserBanner";
const Header = ({
  onOpenSearch
}: {
  onOpenSearch: () => void;
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Debug log per verificare lo stato di autenticazione
  console.log('Header - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  return <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-screen-sm items-center justify-between px-4">
        <button className="flex items-center gap-2 hover-scale" aria-label="LiveMoment Home" onClick={() => navigate("/")}>
          <img src="/lovable-uploads/226af222-cb67-49c4-b2d9-a7d1ee44345e.png" alt="Logo LiveMoment" className="h-8 w-auto" />
          <span className="sr-only">LiveMoment</span>
        </button>
        
        {/* Mostra sempre le icone per debug, poi rimuoveremo questa riga */}
        <div className="flex items-center gap-3">
          <NavLink to="/agenda" className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-foreground hover:text-primary">
              <Calendar className="h-4 w-4" />
            </Button>
            <NotificationBadge className="absolute -top-1 -right-1" />
          </NavLink>
          <NavLink to="/profilo" className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-foreground hover:text-primary">
              <User className="h-4 w-4" />
            </Button>
          </NavLink>
        </div>
      </div>
    </header>;
};
const BottomTabBar = () => {
  const location = useLocation();
  const isActive = (to: string) => location.pathname === to;
  const base = "flex flex-1 flex-col items-center justify-center py-3 text-xs";
  const active = "text-primary font-medium";
  const idle = "text-muted-foreground";
  return <nav className="sticky bottom-0 z-40 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto grid max-w-screen-sm grid-cols-4 px-2">
        <NavLink to="/inviti" className={cn(base, isActive("/inviti") ? active : idle)}>
          <MessageSquareText className="h-6 w-6 mb-1" />
          <span>Inviti</span>
        </NavLink>
        <NavLink to="/esplora" className={cn(base, isActive("/esplora") ? active : idle)}>
          <SearchIcon className="h-6 w-6 mb-1" />
          <span>Esplora</span>
        </NavLink>
        <NavLink to="/gruppi" className={cn(base, isActive("/gruppi") ? active : idle)}>
          <Users className="h-6 w-6 mb-1" />
          <span>Gruppi</span>
        </NavLink>
        <NavLink to="/momenti" className={cn(base, isActive("/momenti") ? active : idle)}>
          <MapPin className="h-6 w-6 mb-1" />
          <span>Momenti</span>
        </NavLink>
      </div>
    </nav>;
};
export default function AppLayout() {
  const {
    pathname
  } = useLocation();
  const {
    isAuthenticated
  } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    // Focus management or analytics could go here
  }, [pathname]);
  return <div className="mx-auto flex min-h-svh w-full max-w-screen-sm flex-col">
      <Header onOpenSearch={() => setSearchOpen(true)} />
      {!isAuthenticated && <GuestBanner />}
      <UnconfirmedUserBanner />
      <main className="flex-1 px-4 pb-24 pt-3 animate-fade-in">
        <Outlet />
      </main>

      {/* Floating Create Button */}
      <div className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2">
        <AuthGuard title="Accedi per creare" description="Accedi per creare momenti, eventi o inviti" fallback={<Button size="lg" className="shadow-lg opacity-80">
              <Plus className="mr-2 h-5 w-5" /> Accedi per creare
            </Button>}>
          <NavLink to="/crea" aria-label="Crea un momento o invito">
            <Button size="lg" className="shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> Crea
            </Button>
          </NavLink>
        </AuthGuard>
      </div>

      <BottomTabBar />

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </div>;
}