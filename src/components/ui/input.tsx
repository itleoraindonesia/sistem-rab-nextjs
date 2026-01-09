import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "default" | "error" | "success";
  size?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", size = "md", type, ...props }, ref) => {
    // Variant styles menggunakan CSS variables dari globals.css
    const variantStyles = {
      default: "",
      error: "border-destructive focus-visible:ring-destructive/20",
      success: "border-green-500 focus-visible:ring-green-500/20"
    };

    // Size styles
    const sizeStyles = {
      sm: "h-8 px-2 py-1 text-xs",
      md: "h-9 px-3 py-1 text-sm",
      lg: "h-11 px-4 py-2 text-base"
    };

    return (
      <input
        type={type}
        className={cn(
          // Base styles dengan CSS variables
          "flex w-full rounded-md border border-border-secondary/60 bg-background text-foreground shadow-sm",
          "transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Focus states
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary/20",
          // Placeholder
          "placeholder:text-muted-foreground",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Hover
          "hover:border-border-secondary",
          // Apply variants & sizes
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };