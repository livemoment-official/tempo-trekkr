import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessageSquareText, MapPin, Search as SearchIcon, Plus, Calendar, User, Bell, Users, UserPlus, Bot, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { GuestBanner } from "@/components/auth/GuestBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { UnconfirmedUserBanner } from "@/components/auth/UnconfirmedUserBanner";
import { FriendSuggestionsModal } from "@/components/profile/FriendSuggestionsModal";
import { EnhancedImage } from "@/components/ui/enhanced-image";
const Header = ({
  onOpenSearch,
  onOpenFriends
}: {
  onOpenSearch: () => void;
  onOpenFriends: () => void;
}) => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoading
  } = useAuth();

  // Debug log per verificare lo stato di autenticazione
  console.log('Header - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  return <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85 shadow-ios-light">
      <div className="mx-auto flex h-16 w-full max-w-screen-sm items-center justify-between px-5">
        <button className="flex items-center gap-2 hover-scale press-scale" aria-label="LiveMoment Home" onClick={() => navigate("/")}>
          <EnhancedImage src="/lovable-uploads/226af222-cb67-49c4-b2d9-a7d1ee44345e.png" alt="Logo LiveMoment" className="h-11 w-auto" fallbackSrc="/placeholder.svg" showSkeleton={false} />
          <span className="sr-only">LiveMoment</span>
        </button>
        
        <div className="flex items-center gap-2">
          <NavLink to="/agenda" className="relative">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-foreground hover:text-primary hover:bg-muted/50 rounded-xl">
              <Calendar className="h-5 w-5" />
            </Button>
            <NotificationBadge className="absolute -top-1 -right-1" />
          </NavLink>
          
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-foreground hover:text-primary hover:bg-muted/50 rounded-xl" onClick={() => navigate("/premi")} aria-label="Premi">
            <Trophy className="h-5 w-5" />
          </Button>
          
          <NavLink to="/profilo" className="relative">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-foreground hover:text-primary hover:bg-muted/50 rounded-xl">
              <User className="h-5 w-5" />
            </Button>
          </NavLink>
        </div>
      </div>
    </header>;
};
const BottomTabBar = () => {
  const location = useLocation();
  const isActive = (to: string) => location.pathname === to;
  const base = "flex flex-1 flex-col items-center justify-center py-2.5 text-xs transition-smooth hover-scale";
  const active = "text-primary font-medium";
  const idle = "text-muted-foreground";
  return <nav className="sticky bottom-0 z-40 border-t border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 shadow-ios-elevated">
      <div className="mx-auto grid max-w-screen-sm grid-cols-4 px-3 py-1">
        <NavLink to="/inviti" className={cn(base, isActive("/inviti") ? active : idle)}>
          <div className={cn("flex flex-col items-center", isActive("/inviti") && "pill-active")}>
            <MessageSquareText className="h-6 w-6 mb-1.5" strokeWidth={1.5} />
            <span className="text-xs">Inviti</span>
          </div>
        </NavLink>
        <NavLink to="/esplora" className={cn(base, isActive("/esplora") ? active : idle)}>
          <div className={cn("flex flex-col items-center", isActive("/esplora") && "pill-active")}>
            <SearchIcon className="h-6 w-6 mb-1.5" strokeWidth={1.5} />
            <span className="text-xs">Esplora</span>
          </div>
        </NavLink>
        <NavLink to="/gruppi" className={cn(base, isActive("/gruppi") ? active : idle)}>
          <div className={cn("flex flex-col items-center", isActive("/gruppi") && "pill-active")}>
            <Users className="h-6 w-6 mb-1.5" strokeWidth={1.5} />
            <span className="text-xs">Gruppi</span>
          </div>
        </NavLink>
        <NavLink to="/momenti" className={cn(base, isActive("/momenti") ? active : idle)}>
          <div className={cn("flex flex-col items-center", isActive("/momenti") && "pill-active")}>
            <MapPin className="h-6 w-6 mb-1.5" strokeWidth={1.5} />
            <span className="text-xs">Momenti</span>
          </div>
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
  const [friendsOpen, setFriendsOpen] = useState(false);
  useEffect(() => {
    // Focus management or analytics could go here
  }, [pathname]);
  return <div className="mx-auto flex min-h-svh w-full max-w-screen-sm flex-col">
      <Header onOpenSearch={() => setSearchOpen(true)} onOpenFriends={() => setFriendsOpen(true)} />
      {!isAuthenticated && <GuestBanner />}
      <UnconfirmedUserBanner />
      <main className="flex-1 px-5 pb-28 pt-4 animate-fade-in">
        <Outlet />
      </main>

      {/* Apple-style Floating Create Button */}
      <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2">
        <AuthGuard title="Accedi per creare" description="Accedi per creare momenti, eventi o inviti" fallback={<Button size="lg" className="shadow-ios-floating opacity-80 rounded-2xl h-14 px-8 gradient-brand text-brand-black font-medium border border-brand-primary/20">
              <Plus className="mr-2 h-6 w-6" strokeWidth={2.5} /> Accedi per creare
            </Button>}>
          <NavLink to="/crea" aria-label="Crea un momento o invito">
            <Button size="lg" className="shadow-ios-floating rounded-2xl h-14 px-8 gradient-brand text-brand-black font-medium border border-brand-primary/20 hover-scale press-scale">
              <Plus className="mr-2 h-6 w-6" strokeWidth={2.5} /> Crea
            </Button>
          </NavLink>
        </AuthGuard>
      </div>

      <BottomTabBar />

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
      
      {/* Friends Modal */}
      <FriendSuggestionsModal open={friendsOpen} onOpenChange={setFriendsOpen} />
    </div>;
}