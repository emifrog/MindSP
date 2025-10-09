import * as React from "react";
import { cn } from "@/lib/utils";

const CardModern = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glass" | "gradient" | "glow";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "shadow-modern hover:shadow-modern-lg transition-shadow",
    glass: "glass shadow-modern",
    gradient: "gradient-primary text-white shadow-modern-lg",
    glow: "shadow-modern glow-primary",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
CardModern.displayName = "CardModern";

const CardModernHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardModernHeader.displayName = "CardModernHeader";

const CardModernTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean;
  }
>(({ className, gradient = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      gradient && "text-gradient",
      className
    )}
    {...props}
  />
));
CardModernTitle.displayName = "CardModernTitle";

const CardModernDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardModernDescription.displayName = "CardModernDescription";

const CardModernContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardModernContent.displayName = "CardModernContent";

const CardModernFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardModernFooter.displayName = "CardModernFooter";

export {
  CardModern,
  CardModernHeader,
  CardModernFooter,
  CardModernTitle,
  CardModernDescription,
  CardModernContent,
};
