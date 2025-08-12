import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessageSquareText, MapPin, Calendar, User, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-screen-sm items-center justify-between px-4">
        <button
          className="flex items-center gap-2 hover-scale"
          aria-label="LiveMoment Home"
          onClick={() => navigate("/")}
        >
          <img
            src="/lovable-uploads/226af222-cb67-49c4-b2d9-a7d1ee44345e.png"
            alt="Logo LiveMoment"
            className="h-8 w-auto"
          />
          <span className="sr-only">LiveMoment</span>
        </button>
        <Button
          variant="hero"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/")}
          aria-label="Apri CioCiPT"
        >
          <Mic className="opacity-90" />
          <span className="hidden sm:inline">CioCiPT</span>
        </Button>
      </div>
    </header>
  );
};

const BottomTabBar = () => {
  const location = useLocation();
  const isActive = (to: string) => location.pathname === to;

  const base = "flex flex-1 items-center justify-center gap-1 py-2 text-xs";
  const active = "text-primary font-medium";
  const idle = "text-muted-foreground";

  return (
    <nav className="sticky bottom-0 z-40 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto grid max-w-screen-sm grid-cols-3 px-2">
        <NavLink to="/inviti" className={cn(base, isActive("/inviti") ? active : idle)}>
          <MessageSquareText /> <span>Inviti</span>
        </NavLink>
        <NavLink to="/momenti" className={cn(base, isActive("/momenti") ? active : idle)}>
          <MapPin /> <span>Momenti</span>
        </NavLink>
        <NavLink to="/profilo" className={cn(base, isActive("/profilo") ? active : idle)}>
          <User /> <span>Profilo</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default function AppLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Focus management or analytics could go here
  }, [pathname]);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-screen-sm flex-col">
      <Header />
      <main className="flex-1 px-4 pb-20 pt-3 animate-fade-in">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
