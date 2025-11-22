import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded border border-[#CBD5E1] ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        checked ? "bg-[#14B8A6] border-[#14B8A6] text-white" : "bg-white",
        className
      )}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      {...props}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
