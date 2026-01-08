import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
  }
>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? "span" : "button";

    // DaisyUI button base class
    const baseClasses = "btn";

    // Map variants to DaisyUI classes
    const variantClasses = {
      default: "btn-primary",
      destructive: "btn-error",
      outline: "btn-outline btn-primary",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      link: "btn-link",
    };

    // Map sizes to DaisyUI classes
    const sizeClasses = {
      default: "",
      sm: "btn-sm",
      lg: "btn-lg",
      icon: "btn-square",
    };

    const finalClassName = cn(
      baseClasses,
      variantClasses[variant] || variantClasses.default,
      sizeClasses[size] || sizeClasses.default,
      className
    );

    return <Comp className={finalClassName} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

export default Button;
