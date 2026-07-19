import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, cta, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4", className)}>
      <div className="rounded-full bg-coral-100/60 p-4 mb-4">
        <Icon className="h-8 w-8 text-coral-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>
      )}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
