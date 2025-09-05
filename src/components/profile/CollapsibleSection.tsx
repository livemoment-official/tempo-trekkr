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

  return (
    <Card className={`shadow-card transition-smooth hover:shadow-elevated ${className}`}>
      <CardHeader className="pb-2">
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-0 h-auto hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-base">{title}</span>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0 animate-fade-in">
          {children}
        </CardContent>
      )}
    </Card>
  );
}