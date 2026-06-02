"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Boxes, ListChecks, ScrollText, LogOut, ChevronDown, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { BannerAd } from "./banner-ad";
import { UpdateChecker } from "./update-checker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

const CATEGORY_ORDER: { slug: string; label: string }[] = [
  { slug: "infra", label: "Infraestrutura" },
  { slug: "database", label: "Banco de dados" },
  { slug: "messaging", label: "Mensageria" },
  { slug: "automation", label: "Automação" },
  { slug: "ai", label: "IA" },
  { slug: "crm", label: "CRM & Suporte" },
  { slug: "cms", label: "CMS & No-Code" },
  { slug: "communication", label: "Comunicação" },
  { slug: "marketing", label: "Marketing" },
  { slug: "scheduling", label: "Agendamento" },
  { slug: "storage", label: "Armazenamento" },
  { slug: "monitoring", label: "Monitoramento" },
  { slug: "erp", label: "ERP" },
  { slug: "analytics", label: "Analytics" },
  { slug: "auth", label: "Autenticação" },
  { slug: "chatbot", label: "Chatbots" },
  { slug: "media", label: "Mídia" },
  { slug: "remote", label: "Acesso Remoto" },
  { slug: "design", label: "Design" },
];

const navLinks = [
  { href: "/catalog", label: "Catálogo", icon: Boxes },
  { href: "/stacks", label: "Instaladas", icon: ListChecks },
  { href: "/logs", label: "Audit log", icon: ScrollText },
];

export function Sidebar() {
  const path = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const activeCategory = path === "/catalog" ? search.get("category") : null;

  useEffect(() => {
    fetch("/api/stacks")
      .then((r) => r.json())
      .then((d) => {
        const c: Record<string, number> = {};
        for (const s of d.catalog ?? []) {
          c[s.category] = (c[s.category] ?? 0) + 1;
        }
        setCounts(c);
      })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col glass-md rounded-lg overflow-hidden">
      <div className="py-5 px-4 flex flex-col items-center gap-1.5 border-b border-glass-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Encha AI"
          width={160}
          height={32}
          className="h-8 w-auto dark:brightness-0 dark:invert"
        />
        <span className="text-xs font-bold text-warm-700 dark:text-warm-300 tracking-wide">
          Encha Setup
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navLinks.map((l) => {
          const Icon = l.icon;
          const active =
            (path === l.href || path.startsWith(l.href + "/")) &&
            !(l.href === "/catalog" && activeCategory);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-coral-500/10 text-coral-700 dark:text-coral-300"
                  : "text-warm-700 dark:text-warm-300 hover:bg-glass-strong hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}

        <Collapsible defaultOpen={!!activeCategory}>
          <CollapsibleTrigger
            className={cn(
              "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all group",
              activeCategory
                ? "bg-coral-500/10 text-coral-700 dark:text-coral-300"
                : "text-warm-700 dark:text-warm-300 hover:bg-glass-strong hover:text-foreground"
            )}
          >
            <Layers className="h-4 w-4" />
            <span className="flex-1 text-left">Categorias</span>
            <ChevronDown className="h-4 w-4 transition-transform group-aria-expanded:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 ml-2 pl-3 border-l border-glass-border space-y-0.5">
              {CATEGORY_ORDER.map((c) => {
                const count = counts[c.slug] ?? 0;
                if (count === 0) return null;
                const isActive = activeCategory === c.slug;
                return (
                  <Link
                    key={c.slug}
                    href={`/catalog?category=${c.slug}`}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs transition-all",
                      isActive
                        ? "bg-coral-500/15 text-coral-700 dark:text-coral-300 font-medium"
                        : "text-warm-600 dark:text-warm-400 hover:bg-glass-strong hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{c.label}</span>
                    <span className="text-[10px] opacity-60 tabular-nums">{count}</span>
                  </Link>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </nav>

      <div className="p-3 border-t border-glass-border space-y-2">
        <UpdateChecker />
        <BannerAd variant="sidebar" />
        <ThemeToggle className="w-full" />
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 dark:text-warm-300 hover:bg-destructive-soft hover:text-destructive transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
