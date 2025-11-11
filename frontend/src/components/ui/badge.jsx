/** 🎨 ness. Design System - "Invisible Elegance" */
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge - Subtle yet clear information
 *
 * default (Present): Primary blue - important highlights
 * outline (Invisible): Subtle border - discrete categorization
 * secondary (Invisible): Soft background - metadata
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-fast ease-elegant",
  {
    variants: {
      variant: {
        // Present - important highlight
        default:
          "border-primary-500/20 bg-primary-500/10 text-primary-400 hover:bg-primary-500/15",
        
        // Invisible - secondary information
        secondary:
          "border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-800",
        
        // Outline - subtle categorization
        outline: 
          "border-slate-600 bg-transparent text-slate-300 hover:border-slate-500 hover:text-slate-200",
        
        // Destructive - present when critical
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15",
        
        // Success - present when positive
        success:
          "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/15",
        
        // Warning - present when attention is needed
        warning:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }



