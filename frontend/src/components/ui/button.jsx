import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#14B8A6] text-white hover:bg-[#0891B2] focus-visible:ring-[#14B8A6]",
        secondary: "bg-transparent border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#F1F5F9]",
        ghost: "bg-transparent text-[#14B8A6] hover:bg-[#5EEAD4]/20",
        destructive: "bg-[#EF4444] text-white hover:bg-[#DC2626]",
        outline: "border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#0F172A]",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-8 py-3 text-lg",
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
