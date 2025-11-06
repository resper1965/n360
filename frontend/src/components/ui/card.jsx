/** 🎨 ness. Design System - "Invisível Elegância" */
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card - Invisível quando funciona, Presente quando importa
 * Background: slate-850 (invisível)
 * Hover: Sutil elevação + borda primária (presente)
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Invisível (estado padrão)
      "rounded-lg border border-slate-700/50 bg-slate-850 text-slate-200",
      // Presente (hover)
      "transition-all duration-base ease-elegant",
      "hover:border-primary-500/20 hover:shadow-elegant-hover hover:-translate-y-0.5",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader - Espaçamento generoso (respira)
 */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle - Tipografia como protagonista
 * Montserrat Light, tracking tight
 */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display text-xl font-light leading-tight tracking-tight text-slate-100",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription - Texto secundário respirável
 */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-slate-400 leading-relaxed",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent - Conteúdo com espaçamento elegante
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter - Rodapé alinhado
 */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }


