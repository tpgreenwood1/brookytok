"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-colors active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          variant === "primary" && "bg-brand text-white hover:bg-brand-hover",
          variant === "secondary" &&
            "bg-transparent border border-border text-foreground hover:bg-surface-2",
          variant === "ghost" &&
            "bg-transparent text-brand hover:bg-brand-light",
          variant === "destructive" && "bg-destructive text-white hover:opacity-90",
          size === "sm" && "h-8 px-4 text-sm",
          size === "md" && "h-9 px-5 text-sm",
          size === "lg" && "h-11 px-6 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
