import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-base",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }


