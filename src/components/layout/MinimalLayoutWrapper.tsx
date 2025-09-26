import { ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
interface MinimalLayoutWrapperProps {
  title: string;
  children?: ReactNode;
}
export default function MinimalLayoutWrapper({
  title,
  children
}: MinimalLayoutWrapperProps) {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background">
      {/* Minimal Header with back button and title */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>
    </div>;
}