"use client";
import { useState, useRef, useEffect, createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Ctx = { open: boolean; toggle: () => void };
const CollapsibleCtx = createContext<Ctx | null>(null);

export function Collapsible({
  defaultOpen = false,
  open: controlled,
  onOpenChange,
  children,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  children: ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlled ?? uncontrolled;
  const toggle = () => {
    const next = !open;
    if (controlled === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };
  return <CollapsibleCtx.Provider value={{ open, toggle }}>{children}</CollapsibleCtx.Provider>;
}

export function CollapsibleTrigger({
  children,
  className,
  asChild = false,
}: {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const ctx = useContext(CollapsibleCtx)!;
  if (asChild) {
    return (
      <span onClick={ctx.toggle} role="button" tabIndex={0} className={className}>
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={ctx.toggle}
      aria-expanded={ctx.open}
      className={className}
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(CollapsibleCtx)!;
  const ref = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState(ctx.open ? "none" : "0px");

  useEffect(() => {
    if (!ref.current) return;
    if (ctx.open) {
      const h = ref.current.scrollHeight;
      setMaxH(`${h}px`);
      const t = setTimeout(() => setMaxH("none"), 250);
      return () => clearTimeout(t);
    } else {
      if (maxH === "none" && ref.current) setMaxH(`${ref.current.scrollHeight}px`);
      requestAnimationFrame(() => setMaxH("0px"));
    }
  }, [ctx.open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={ref}
      style={{ maxHeight: maxH }}
      className={cn(
        "overflow-hidden transition-[max-height] duration-200 ease-out",
        className
      )}
      aria-hidden={!ctx.open}
    >
      {children}
    </div>
  );
}
