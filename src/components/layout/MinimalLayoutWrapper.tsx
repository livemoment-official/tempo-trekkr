import { ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MinimalLayoutWrapperProps {
  title: string;
  children?: ReactNode;
}

export default function MinimalLayoutWrapper({ title, children }: MinimalLayoutWrapperProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header with back button and title */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>
    </div>
  );
}