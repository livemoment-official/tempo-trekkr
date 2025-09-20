import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  icon?: React.ReactNode;
}
export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  badge,
  badgeVariant = "outline",
  className,
  icon
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return <Card className={`shadow-card transition-smooth hover:shadow-elevated ${className}`}>
      
      
      {isOpen && <CardContent className="pt-0 animate-fade-in">
          {children}
        </CardContent>}
    </Card>;
}