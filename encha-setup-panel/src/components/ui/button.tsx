import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "btn-gradient-primary text-white hover:-translate-y-px active:translate-y-0",
        primary:
          "btn-gradient-primary text-white hover:-translate-y-px active:translate-y-0",
        secondary:
          "glass-sm text-foreground hover:bg-glass-strong",
        outline:
          "border border-border bg-transparent hover:bg-accent text-foreground",
        ghost:
          "text-foreground hover:bg-accent",
        destructive:
          "btn-gradient-danger text-white hover:-translate-y-px",
        glass:
          "glass-md text-foreground hover:bg-glass-strong",
        link:
          "text-primary underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
