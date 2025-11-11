/** 🎨 ness. Design System - "Invisible Elegance" */
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button variants - "Present when it matters" philosophy
 *
 * default (Present): Primary blue - important CTAs
 * outline (Invisible→Present): Subtle border that gains presence on hover
 * ghost (Invisible): Completely discreet
 * link (Invisible): Text-only action
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-base ease-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        // Present - key primary action
        default:
          "bg-primary-500 text-slate-100 shadow-elegant hover:bg-primary-600 hover:shadow-present active:scale-98",
        
        // Invisible→Present - secondary action
        outline:
          "border border-slate-700 bg-transparent text-slate-200 hover:bg-primary-500/10 hover:border-primary-500/50 hover:text-primary-400",
        
        // Invisible - tertiary action
        ghost: 
          "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
        
        // Link - minimalist
        link: 
          "text-primary-400 underline-offset-4 hover:underline hover:text-primary-300",
        
        // Destructive - present when critical
        destructive:
          "bg-red-500 text-white shadow-elegant hover:bg-red-600 hover:shadow-present",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-sm",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }


