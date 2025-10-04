import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  label: string;
  color: 'success' | 'warning' | 'danger' | 'info' | 'muted';
  tone: 'dark' | 'light';
  showDot?: boolean;
  className?: string;
  iconLeft?: React.ReactNode;
}

const colorMap = {
  success: 'bg-green-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-sky-400',
  muted: 'bg-gray-400'
};

export function StatusPill({ 
  label, 
  color, 
  tone, 
  showDot = true, 
  className,
  iconLeft 
}: StatusPillProps) {
  const toneClasses = tone === 'dark'
    ? "bg-black/60 text-white border-white/20 backdrop-blur-sm"
    : "bg-white/80 text-foreground border-border/50";

  return (
    <Badge 
      variant="minimal" 
      className={cn(
        toneClasses,
        "shadow-card",
        className
      )}
    >
      {iconLeft && <span className="mr-1.5">{iconLeft}</span>}
      {showDot && (
        <div className={cn("w-2 h-2 rounded-full mr-1.5", colorMap[color])} />
      )}
      {label}
    </Badge>
  );
}
