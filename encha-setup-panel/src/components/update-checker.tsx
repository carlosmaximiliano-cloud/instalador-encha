"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpCircle, Loader2, RefreshCw, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type VersionInfo = {
  current: string;
  latest: string | null;
  updateAvailable: boolean;
  releaseUrl: string | null;
  releaseNotesHtml: string | null;
  publishedAt: number | null;
};

type Phase = "idle" | "confirm" | "updating" | "done";

export function UpdateChecker() {
  const [info, setInfo] = useState<VersionInfo | null>(null);
  const [csrf, setCsrf] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadVersion = useCallback(() => {
    return fetch("/api/version")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: VersionInfo | null) => {
        if (d?.current) setInfo(d);
        return d;
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    loadVersion();
    fetch("/api/csrf")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.token && setCsrf(d.token))
      .catch(() => {});
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadVersion]);

  // Depois de disparar o update, faz polling até a versão nova responder (container novo no ar).
  function startPolling(target: string) {
    let elapsed = 0;
    pollRef.current = setInterval(async () => {
      elapsed += 5;
      const d = await loadVersion();
      if (d?.current === target) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("done");
        setTimeout(() => window.location.reload(), 1500);
      } else if (elapsed >= 180) {
        // 3 min: o redeploy demora mais que o esperado; encerra o polling sem travar a UI.
        if (pollRef.current) clearInterval(pollRef.current);
        setError("A atualização está demorando. Recarregue a página em instantes.");
        setPhase("confirm");
      }
    }, 5000);
  }

  async function runUpdate() {
    if (!csrf || !info?.latest) return;
    setError("");
    setPhase("updating");
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Falha ao iniciar a atualização");
        setPhase("confirm");
        return;
      }
      startPolling(info.latest);
    } catch {
      setError("Erro de rede ao iniciar a atualização");
      setPhase("confirm");
    }
  }

  if (!info) return null;

  return (
    <>
      {info.updateAvailable ? (
        <button
          onClick={() => {
            setError("");
            setPhase("confirm");
          }}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium bg-coral-500/10 text-coral-700 dark:text-coral-300 hover:bg-coral-500/20 transition-all"
        >
          <ArrowUpCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Nova versão {info.latest}</span>
          <span className="text-[10px] opacity-70">Atualizar</span>
        </button>
      ) : (
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground tabular-nums">
          <span>v{info.current}</span>
        </div>
      )}

      <Dialog
        open={phase !== "idle"}
        onOpenChange={(o) => {
          // Não fecha durante a atualização.
          if (!o && phase !== "updating" && phase !== "done") setPhase("idle");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-coral-600" />
              Atualizar painel
            </DialogTitle>
            <DialogDescription>
              {phase === "done"
                ? "Atualização concluída."
                : phase === "updating"
                  ? "Aplicando a atualização — o painel vai reiniciar."
                  : `Atualizar da versão ${info.current} para ${info.latest}?`}
            </DialogDescription>
          </DialogHeader>

          {phase === "confirm" && info.releaseNotesHtml ? (
            <div
              className="text-sm leading-relaxed rounded-md bg-glass-strong p-3 max-h-60 overflow-y-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:font-semibold [&_h2]:mt-2 [&_h3]:font-semibold [&_a]:text-coral-600 [&_a]:underline space-y-1"
              // Conteúdo autorado no admin do Monitor (fonte confiável).
              dangerouslySetInnerHTML={{ __html: info.releaseNotesHtml }}
            />
          ) : null}

          {error ? (
            <div className="rounded-md bg-destructive-soft text-destructive px-3 py-2 text-xs">
              {error}
            </div>
          ) : null}

          {phase === "updating" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Atualizando… aguarde o painel reiniciar.
            </div>
          ) : phase === "done" ? (
            <div className="flex items-center gap-2 text-sm text-success py-2">
              <Check className="h-4 w-4" />
              Atualizado para {info.latest}. Recarregando…
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPhase("idle")}>
                Cancelar
              </Button>
              <Button onClick={runUpdate} disabled={!csrf}>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Atualizar agora
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
