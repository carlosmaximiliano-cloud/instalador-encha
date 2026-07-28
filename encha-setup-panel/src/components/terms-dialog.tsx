"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollText, Check } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

// Gate de Termos de Uso — bloqueia o dashboard inteiro (montado em
// (dashboard)/layout.tsx) até que ESTA versão dos termos seja aceita.
// Propositalmente sem opção de recusar: só existe o botão "Aceitar". Sem
// aceite, o app permanece bloqueado — não há como fechar este diálogo.
export function TermsDialog({ version, contentMd }: { version: string; contentMd: string }) {
  const router = useRouter();
  const [csrf, setCsrf] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/csrf")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.token && setCsrf(d.token))
      .catch(() => {});
  }, []);

  function onScroll() {
    const el = contentRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) setScrolledToEnd(true);
  }

  async function accept() {
    if (!csrf) return;
    setError("");
    setAccepting(true);
    try {
      const res = await fetch("/api/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ version }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (data.error ?? "Falha ao registrar o aceite") +
            " — se o problema persistir, use a opção 97 no menu SSH."
        );
        setAccepting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Erro de rede ao registrar o aceite.");
      setAccepting(false);
    }
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        hideClose
        className="max-w-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-coral-600" />
            Termos de Uso
          </DialogTitle>
          <DialogDescription>
            Os Termos de Uso do Encha Setup foram atualizados (versão {version}). É preciso aceitar
            para continuar usando o painel.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={contentRef}
          onScroll={onScroll}
          className="text-sm leading-relaxed rounded-md bg-glass-strong p-4 max-h-[55vh] overflow-y-auto space-y-2"
        >
          {renderMarkdown(contentMd)}
        </div>

        {error ? (
          <div className="rounded-md bg-destructive-soft text-destructive px-3 py-2 text-xs">{error}</div>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={accept} disabled={!csrf || accepting}>
            <Check className="h-4 w-4 mr-1.5" />
            {accepting ? "Registrando…" : scrolledToEnd ? "Aceitar" : "Li e aceito"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
