import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 press-scale hover-scale",
  {
    variants: {
      variant: {
        default: "gradient-brand text-brand-black shadow-ios-elevated hover:shadow-ios-floating border border-brand-primary/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-ios-light",
        outline: "border border-border/60 bg-background hover:bg-muted/50 hover:border-border/80 shadow-ios-light",
        secondary: "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90 shadow-ios-light",
        ghost: "hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-2xl",
        link: "text-primary underline-offset-4 hover:underline",
        minimal: "bg-white text-foreground hover:bg-muted/30 border border-border/50 shadow-ios-light rounded-2xl",
        chip: "bg-white text-foreground hover:bg-muted/50 rounded-pill h-9 px-5 py-2 border border-border/60 text-xs font-medium shadow-ios-light"
      },
      size: {
        default: "h-12 px-7 py-3 rounded-2xl",
        sm: "h-10 rounded-xl px-5 text-sm",
        lg: "h-14 rounded-2xl px-9 text-base",
        icon: "h-12 w-12 rounded-2xl",
        xs: "h-8 px-4 text-xs rounded-xl"
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
