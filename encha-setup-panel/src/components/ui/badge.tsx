import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 h-5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-soft text-primary-soft-foreground",
        primary: "bg-primary-soft text-primary-soft-foreground",
        success: "bg-success-soft text-success-foreground",
        warning: "bg-warning-soft text-warning-foreground",
        destructive: "bg-destructive-soft text-destructive",
        danger: "bg-destructive-soft text-destructive",
        info: "bg-info-soft text-info-foreground",
        neutral: "bg-muted text-muted-foreground",
        outline: "border border-border text-foreground",
        solid: "bg-primary text-primary-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
