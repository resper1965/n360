/** 🎨 ness. Design System - "Invisible Elegance" */
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card - Invisible when it works, present when it matters
 * Background: slate-850 (invisible)
 * Hover: Subtle elevation + primary border (present)
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Invisible (default state)
      "rounded-lg border border-slate-700/50 bg-slate-850 text-slate-200",
      // Present (hover state)
      "transition-all duration-base ease-elegant",
      "hover:border-primary-500/20 hover:shadow-elegant-hover hover:-translate-y-0.5",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader - Generous spacing for breathing room
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
 * CardTitle - Typography as the protagonist
 * Montserrat Light, tight tracking
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
 * CardDescription - Comfortable secondary text
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
 * CardContent - Content with elegant spacing
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter - Aligned footer
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


