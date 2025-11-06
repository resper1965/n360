/** 🎨 ness. Design System - "Invisível Elegância" */
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button Variants - Filosofia "Presente quando importa"
 * 
 * default (Presente): Azul primário - CTAs importantes
 * outline (Invisível→Presente): Borda sutil que ganha presença no hover
 * ghost (Invisível): Totalmente discreto
 * link (Invisível): Apenas texto
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-base ease-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        // Presente - Ação primária importante
        default:
          "bg-primary-500 text-slate-100 shadow-elegant hover:bg-primary-600 hover:shadow-present active:scale-98",
        
        // Invisível→Presente - Ação secundária
        outline:
          "border border-slate-700 bg-transparent text-slate-200 hover:bg-primary-500/10 hover:border-primary-500/50 hover:text-primary-400",
        
        // Invisível - Ação terciária
        ghost: 
          "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
        
        // Link - Minimalista
        link: 
          "text-primary-400 underline-offset-4 hover:underline hover:text-primary-300",
        
        // Destrutivo - Presente quando crítico
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


