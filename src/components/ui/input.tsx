import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const isTimeOrDate = type === 'time' || type === 'date';
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-xl border border-border bg-background px-4 py-3 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-smooth shadow-card",
          isTimeOrDate ? "h-12 sm:h-11 text-base sm:text-sm min-h-[48px]" : "h-11 text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
