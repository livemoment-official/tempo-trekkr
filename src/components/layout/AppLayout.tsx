import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessageSquareText, MapPin, Search as SearchIcon, Plus, Calendar, User, Bell, Users, UserPlus, Bot } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import mascotLogo from "@/assets/livemoment-mascot.png";
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
    isLoading,
    user
  } = useAuth();

  // Debug log per verificare lo stato di autenticazione
  console.log('Header - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  return <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85 shadow-ios-light">
      <div className="mx-auto flex h-16 w-full max-w-screen-sm items-center justify-between px-5">
        <button className="flex items-center gap-2 hover-scale press-scale" aria-label="LiveMoment Home" onClick={() => navigate("/")}>
          <EnhancedImage src={mascotLogo} alt="LiveMoment Mascot" fallbackSrc="/placeholder.svg" showSkeleton={false} className="h-8 w-8 object-contain" />
          
        </button>
        
        <div className="flex items-center gap-3">
          {/* Aggiungi Amici Banner - moved to left */}
          <NavLink to="/trova-amici" className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-full text-sm font-medium text-black border border-gray-200 transition-colors hover-scale press-scale">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Aggiungi Amici</span>
          </NavLink>
          
          {/* Agenda with notification */}
          <NavLink to="/agenda" className="relative">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-foreground hover:text-primary hover:bg-muted/50 rounded-xl">
              <Calendar className="h-5 w-5" />
            </Button>
            <NotificationBadge className="absolute -top-1 -right-1" />
          </NavLink>
          
          {/* Profile Avatar */}
          <NavLink to="/profilo" className="relative hover-scale press-scale">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || user?.user_metadata?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
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

  // Check if we're on the Crea page to hide main UI
  const isCreatePage = pathname === '/crea';
  useEffect(() => {
    // Focus management or analytics could go here
  }, [pathname]);
  return <div className="mx-auto flex min-h-svh w-full max-w-screen-sm flex-col">
      {!isCreatePage && <Header onOpenSearch={() => setSearchOpen(true)} onOpenFriends={() => setFriendsOpen(true)} />}
      {!isAuthenticated && !isCreatePage && <GuestBanner />}
      {!isCreatePage && <UnconfirmedUserBanner />}
      <main className={isCreatePage ? "flex-1" : "flex-1 px-5 pb-28 pt-4 animate-fade-in"}>
        <Outlet />
      </main>

      {/* Apple-style Floating Create Button - hidden on create page */}
      {!isCreatePage && <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2">
          <AuthGuard title="Accedi per creare" description="Accedi per creare momenti, eventi o inviti" fallback={<Button size="lg" className="shadow-ios-floating opacity-80 rounded-2xl h-14 px-8 gradient-brand text-brand-black font-medium border border-brand-primary/20">
                <Plus className="mr-2 h-6 w-6" strokeWidth={2.5} /> Accedi per creare
              </Button>}>
            <NavLink to="/crea" aria-label="Crea un momento o invito">
              <Button size="lg" className="shadow-ios-floating rounded-2xl h-14 px-8 gradient-brand text-brand-black font-medium border border-brand-primary/20 hover-scale press-scale">
                <Plus className="mr-2 h-6 w-6" strokeWidth={2.5} /> Crea
              </Button>
            </NavLink>
          </AuthGuard>
        </div>}

      {!isCreatePage && <BottomTabBar />}

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
      
      {/* Friends Modal */}
      <FriendSuggestionsModal open={friendsOpen} onOpenChange={setFriendsOpen} />
    </div>;
}