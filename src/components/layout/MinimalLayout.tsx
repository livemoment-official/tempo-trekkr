import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MinimalLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header with just back button */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}