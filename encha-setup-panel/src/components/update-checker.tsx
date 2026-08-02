"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpCircle, Loader2, RefreshCw, Check, CircleCheck } from "lucide-react";
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

// scripts: passo 1, atualiza /root/main.sh + /root/SetupEnchaAI + /root/encha-setup-panel
//          via container avulso no host (POST /api/update/scripts).
// panel:   passo 2, troca a imagem do service Swarm do próprio painel
//          (POST /api/update, existente) — sempre por último, pois derruba
//          o container que está atendendo a requisição.
type Phase = "idle" | "confirm" | "scripts" | "panel" | "done";

export function UpdateChecker() {
  const [info, setInfo] = useState<VersionInfo | null>(null);
  const [csrf, setCsrf] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  // true quando o passo de scripts falhou e o usuário pode optar por seguir
  // só com o painel — decisão explícita, registrada no audit log do servidor.
  const [scriptsFailed, setScriptsFailed] = useState(false);
  const [scriptsDone, setScriptsDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Botão manual "Verificar atualizações" — só existe quando updateAvailable
  // já é false (senão o botão de atualizar já está lá). Debounce simples
  // por timestamp, não por setInterval: evita clique repetido acidental
  // sem precisar de mais um cleanup no unmount.
  const [checking, setChecking] = useState(false);
  const [justChecked, setJustChecked] = useState(false);
  const lastCheckAtRef = useRef(0);
  const CHECK_COOLDOWN_MS = 10_000;

  // cache: "no-store" sempre — sem isso, a resposta de /api/version (que
  // manda Cache-Control: private, max-age=300) fica presa no cache HTTP do
  // browser por até 5min. Isso já quebrava o polling silenciosamente: toda
  // atualização bem-sucedida batia o timeout de 300s abaixo achando que
  // "current" nunca convergia com "target", porque o browser respondia com
  // a versão antiga em cache em vez de perguntar de novo pro servidor.
  const loadVersion = useCallback(() => {
    return fetch("/api/version", { cache: "no-store" })
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

  // Só começa a contar quando a fase do painel (passo 2) inicia — do
  // contrário o passo dos scripts (que pode levar ~1min sozinho) consome
  // boa parte do teto. 300s: rolling update num VPS pequeno pode ser lento.
  function startPolling(target: string) {
    let elapsed = 0;
    pollRef.current = setInterval(async () => {
      elapsed += 5;
      const d = await loadVersion();
      if (d?.current === target) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("done");
        setTimeout(() => window.location.reload(), 1500);
      } else if (elapsed >= 300) {
        if (pollRef.current) clearInterval(pollRef.current);
        setError("A atualização está demorando. Recarregue a página em instantes.");
        setPhase("confirm");
      }
    }, 5000);
  }

  async function updatePanelImage() {
    if (!csrf || !info?.latest) return;
    setPhase("panel");
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Falha ao atualizar o painel");
        setPhase("confirm");
        return;
      }
      startPolling(info.latest);
    } catch {
      setError("Erro de rede ao atualizar o painel");
      setPhase("confirm");
    }
  }

  async function runUpdate() {
    if (!csrf || !info?.latest) return;
    setError("");
    setScriptsFailed(false);
    setPhase("scripts");
    try {
      const res = await fetch("/api/update/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Falha ao atualizar os scripts do servidor");
        setScriptsFailed(true);
        setPhase("confirm");
        return;
      }
      setScriptsDone(true);
      await updatePanelImage();
    } catch {
      setError("Erro de rede ao atualizar os scripts do servidor");
      setScriptsFailed(true);
      setPhase("confirm");
    }
  }

  // Override explícito: segue só com o painel depois que os scripts falharam.
  async function skipScriptsAndUpdatePanel() {
    setError("");
    await updatePanelImage();
  }

  async function manualCheck() {
    const now = Date.now();
    if (checking || now - lastCheckAtRef.current < CHECK_COOLDOWN_MS) return;
    lastCheckAtRef.current = now;
    setChecking(true);
    setJustChecked(false);
    await loadVersion();
    setChecking(false);
    setJustChecked(true);
    setTimeout(() => setJustChecked(false), 4000);
  }

  if (!info) return null;

  return (
    <>
      {info.updateAvailable ? (
        <button
          onClick={() => {
            setError("");
            setScriptsFailed(false);
            setScriptsDone(false);
            setPhase("confirm");
          }}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium bg-coral-500/10 text-coral-700 dark:text-coral-300 hover:bg-coral-500/20 transition-all"
        >
          <ArrowUpCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Nova versão {info.latest}</span>
          <span className="text-[10px] opacity-70">Atualizar</span>
        </button>
      ) : (
        <button
          onClick={manualCheck}
          disabled={checking}
          className="w-full flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[10px] text-muted-foreground tabular-nums hover:bg-glass-strong transition-all disabled:opacity-60"
          title="Verificar atualizações"
        >
          <RefreshCw className={`h-3 w-3 shrink-0 ${checking ? "animate-spin" : ""}`} />
          <span>
            v{info.current}
            {justChecked && !checking ? " — você já está na versão mais recente" : ""}
          </span>
        </button>
      )}

      <Dialog
        open={phase !== "idle"}
        onOpenChange={(o) => {
          // Não fecha durante uma atualização em andamento.
          if (!o && phase !== "scripts" && phase !== "panel" && phase !== "done") setPhase("idle");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-coral-600" />
              Atualizar Encha Setup
            </DialogTitle>
            <DialogDescription>
              {phase === "done"
                ? "Atualização concluída."
                : phase === "scripts"
                  ? "Atualizando os scripts do servidor…"
                  : phase === "panel"
                    ? "Atualizando o painel — ele vai reiniciar."
                    : `Atualizar da versão ${info.current} para ${info.latest}?`}
            </DialogDescription>
          </DialogHeader>

          {(phase === "scripts" || phase === "panel" || phase === "done") && (
            <div className="flex flex-col gap-1.5 text-sm">
              <StepRow label="Scripts do servidor" state={scriptsDone ? "done" : "active"} />
              <StepRow
                label="Painel"
                state={phase === "done" ? "done" : phase === "panel" ? "active" : "pending"}
              />
            </div>
          )}

          {phase === "confirm" && !error && info.releaseNotesHtml ? (
            <div
              className="text-sm leading-relaxed rounded-md bg-glass-strong p-3 max-h-60 overflow-y-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:font-semibold [&_h2]:mt-2 [&_h3]:font-semibold [&_a]:text-coral-600 [&_a]:underline space-y-1"
              // Conteúdo autorado no admin do Monitor (fonte confiável).
              dangerouslySetInnerHTML={{ __html: info.releaseNotesHtml }}
            />
          ) : null}

          {error ? (
            <div className="rounded-md bg-destructive-soft text-destructive px-3 py-2 text-xs space-y-1">
              <p>{error}</p>
              {scriptsFailed ? (
                <p className="opacity-80">
                  Alternativa: conecte por SSH e rode a opção 97 do menu (
                  <code>bash /root/SetupEnchaAI</code>).
                </p>
              ) : null}
            </div>
          ) : null}

          {phase === "scripts" || phase === "panel" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {phase === "scripts"
                ? "Baixando e instalando os scripts atualizados…"
                : "Aplicando a atualização… aguarde o painel reiniciar."}
            </div>
          ) : phase === "done" ? (
            <div className="flex items-center gap-2 text-sm text-success py-2">
              <Check className="h-4 w-4" />
              Atualizado para {info.latest}. Recarregando…
            </div>
          ) : (
            <div className="flex justify-end gap-2 flex-wrap">
              <Button variant="secondary" onClick={() => setPhase("idle")}>
                Cancelar
              </Button>
              {scriptsFailed ? (
                <Button variant="secondary" onClick={skipScriptsAndUpdatePanel} disabled={!csrf}>
                  Atualizar só o painel
                </Button>
              ) : null}
              <Button onClick={runUpdate} disabled={!csrf}>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                {scriptsFailed ? "Tentar novamente" : "Atualizar agora"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StepRow({ label, state }: { label: string; state: "pending" | "active" | "done" }) {
  return (
    <div className="flex items-center gap-2">
      {state === "done" ? (
        <CircleCheck className="h-4 w-4 text-success shrink-0" />
      ) : state === "active" ? (
        <Loader2 className="h-4 w-4 animate-spin text-coral-600 shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-muted-foreground/40 shrink-0" />
      )}
      <span className={state === "pending" ? "text-muted-foreground" : ""}>{label}</span>
    </div>
  );
}
