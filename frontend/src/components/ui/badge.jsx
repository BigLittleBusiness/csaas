import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#14B8A6] text-white",
        secondary: "border-transparent bg-[#F1F5F9] text-[#64748B]",
        success: "border-transparent bg-[#10B981] text-white",
        warning: "border-transparent bg-[#F59E0B] text-white",
        destructive: "border-transparent bg-[#EF4444] text-white",
        outline: "border-[#CBD5E1] text-[#64748B]",
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
