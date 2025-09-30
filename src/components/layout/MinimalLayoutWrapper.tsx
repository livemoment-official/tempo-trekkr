import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import StandardHeader from "@/components/layout/StandardHeader";
interface MinimalLayoutWrapperProps {
  title: string;
  children?: ReactNode;
}
export default function MinimalLayoutWrapper({
  title,
  children
}: MinimalLayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header with back button and title */}
      <StandardHeader title={title} />
      
      {/* Main Content */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>
    </div>
  );
}