import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-transparent bg-secondary/10 text-secondary hover:bg-secondary/20",
        accent:
          "border-transparent bg-accent/15 text-amber-700 hover:bg-accent/25",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 border border-emerald-200",
        destructive:
          "border-transparent bg-red-50 text-red-600 border border-red-200",
        outline:
          "text-foreground border border-border bg-white",
        urgent:
          "bg-red-500 text-white animate-pulse shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
