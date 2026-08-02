import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex w-full rounded-md border border-input bg-card/60 backdrop-blur-sm px-3 py-2 text-sm placeholder:text-muted-foreground transition-all focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-[hsl(var(--coral-500)/0.15)] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
