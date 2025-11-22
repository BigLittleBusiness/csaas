import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center space-x-3 overflow-hidden rounded-lg border p-4 pr-10 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-[#E2E8F0] bg-white text-[#0F172A]",
        success: "border-[#10B981] bg-[#10B981]/10 text-[#0F172A]",
        destructive: "border-[#EF4444] bg-[#EF4444]/10 text-[#0F172A]",
        warning: "border-[#F59E0B] bg-[#F59E0B]/10 text-[#0F172A]",
        info: "border-[#14B8A6] bg-[#14B8A6]/10 text-[#0F172A]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const toastIcons = {
  success: CheckCircle,
  destructive: XCircle,
  warning: AlertTriangle,
  info: Info,
  default: null,
}

const toastIconColors = {
  success: "text-[#10B981]",
  destructive: "text-[#EF4444]",
  warning: "text-[#F59E0B]",
  info: "text-[#14B8A6]",
  default: "text-[#64748B]",
}

const Toast = React.forwardRef(({ className, variant, children, ...props }, ref) => {
  const Icon = toastIcons[variant] || toastIcons.default
  const iconColor = toastIconColors[variant] || toastIconColors.default

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {Icon && (
        <div className={cn("flex-shrink-0", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">{children}</div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#E2E8F0] bg-transparent px-3 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-[#64748B] opacity-70 transition-opacity hover:opacity-100 hover:text-[#0F172A] focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-[#0F172A]", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-[#64748B]", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
