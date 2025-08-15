import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-smooth focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent gradient-brand text-brand-black shadow-card",
        secondary:
          "border-border/60 bg-secondary/60 text-secondary-foreground hover:bg-secondary/80 shadow-card",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-card",
        outline: "border-border text-foreground hover:bg-muted/50 shadow-card",
        minimal: "border-border/40 bg-white text-foreground hover:bg-muted/30 shadow-card",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
