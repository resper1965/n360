/** 🎨 ness. Design System - "Invisível Elegância" */
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge - Informação sutil mas clara
 * 
 * default (Presente): Azul primário - informações importantes
 * outline (Invisível): Borda sutil - categorização discreta
 * secondary (Invisível): Background sutil - metadados
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-fast ease-elegant",
  {
    variants: {
      variant: {
        // Presente - Destaque importante
        default:
          "border-primary-500/20 bg-primary-500/10 text-primary-400 hover:bg-primary-500/15",
        
        // Invisível - Informação secundária
        secondary:
          "border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-800",
        
        // Outline - Categorização sutil
        outline: 
          "border-slate-600 bg-transparent text-slate-300 hover:border-slate-500 hover:text-slate-200",
        
        // Destrutivo - Presente quando crítico
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15",
        
        // Sucesso - Presente quando positivo
        success:
          "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/15",
        
        // Warning - Presente quando atenção
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



