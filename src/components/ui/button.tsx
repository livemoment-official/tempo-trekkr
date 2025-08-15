import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 press-scale",
  {
    variants: {
      variant: {
        default: "gradient-brand text-brand-black shadow-brand hover:shadow-elevated border border-brand-black/10",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-card",
        outline: "border border-border bg-background hover:bg-muted/50 hover:border-border/60 shadow-card",
        secondary: "bg-secondary/60 text-secondary-foreground hover:bg-secondary/80 shadow-card",
        ghost: "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        minimal: "bg-white text-foreground hover:bg-muted/30 border border-border/40 shadow-card",
        chip: "bg-white text-foreground hover:bg-muted/50 rounded-full h-8 px-4 py-1.5 border border-border/60 text-xs font-medium shadow-card"
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
        xs: "h-7 px-3 text-xs rounded-lg"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
