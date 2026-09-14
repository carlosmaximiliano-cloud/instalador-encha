"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpCircle, Loader2, RefreshCw, Check, CircleCheck, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n/use-dict";
import { useLocale } from "./locale-provider";
import { updateCheckerText } from "./update-checker.i18n";

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
  const t = useDict(updateCheckerText);
  const { locale } = useLocale();
  const [info, setInfo] = useState<VersionInfo | null>(null);
  const [csrf, setCsrf] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  // true quando o passo de scripts falhou. Não bloqueia mais o update: o
  // painel segue sozinho pro passo 2, e a frota se autocorrige assim que uma
  // release seguinte rodar os scripts com sucesso (ver CLAUDE.md do painel).
  const [scriptsFailed, setScriptsFailed] = useState(false);
  // Mensagem de erro do passo de scripts, mantida visível durante os passos
  // seguintes (painel/done) mesmo depois que o fluxo já seguiu em frente.
  const [scriptsWarning, setScriptsWarning] = useState("");
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
    fetch("/api/csrf")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.token && setCsrf(d.token))
      .catch(() => {});
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // releaseNotesHtml (Fase 5) é resolvido no servidor a partir do cookie de
  // locale — sem refazer o fetch aqui, trocar o idioma deixava a nota de
  // release presa no idioma anterior até o próximo "Check for updates"
  // manual. Mesma causa raiz do achado em catalog/page.tsx.
  useEffect(() => {
    loadVersion();
  }, [locale, loadVersion]);

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
        setError(t.timeoutError);
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
        // Prefere data.message (já traduzida pelo servidor — ver
        // src/lib/api-error.ts) a data.error (o código estável).
        setError(data.message ?? data.error ?? t.updateFailedFallback);
        setPhase("confirm");
        return;
      }
      startPolling(info.latest);
    } catch {
      setError(t.networkErrorPanel);
      setPhase("confirm");
    }
  }

  async function runUpdate() {
    if (!csrf || !info?.latest) return;
    setError("");
    setScriptsFailed(false);
    setScriptsWarning("");
    setPhase("scripts");
    try {
      const res = await fetch("/api/update/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Não bloqueia mais aqui: a imagem do painel segue sozinha, e os
        // scripts ficam para trás até a atualização seguinte tentar de novo.
        setScriptsFailed(true);
        setScriptsWarning(data.message ?? data.error ?? t.scriptsFailedFallback);
        await updatePanelImage();
        return;
      }
      setScriptsDone(true);
      await updatePanelImage();
    } catch {
      setScriptsFailed(true);
      setScriptsWarning(t.networkErrorScripts);
      await updatePanelImage();
    }
  }

  // Retry manual do passo do painel, sem repetir o passo de scripts — usado
  // quando o passo do painel falhou depois de scripts que já haviam falhado.
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
            setScriptsWarning("");
            setScriptsDone(false);
            setPhase("confirm");
          }}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium bg-coral-500/10 text-coral-700 dark:text-coral-300 hover:bg-coral-500/20 transition-all"
        >
          <ArrowUpCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{t.newVersion(info.latest ?? "")}</span>
          <span className="text-[10px] opacity-70">{t.updateBtn}</span>
        </button>
      ) : (
        <button
          onClick={manualCheck}
          disabled={checking}
          className="w-full flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[10px] text-muted-foreground tabular-nums hover:bg-glass-strong transition-all disabled:opacity-60"
          title={t.checkForUpdates}
        >
          <RefreshCw className={`h-3 w-3 shrink-0 ${checking ? "animate-spin" : ""}`} />
          <span>
            v{info.current}
            {justChecked && !checking ? t.alreadyLatest : ""}
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
              {t.dialogTitle}
            </DialogTitle>
            <DialogDescription>
              {phase === "done"
                ? t.descDone
                : phase === "scripts"
                  ? t.descScripts
                  : phase === "panel"
                    ? t.descPanel
                    : t.descConfirm(info.current, info.latest ?? "")}
            </DialogDescription>
          </DialogHeader>

          {(phase === "scripts" || phase === "panel" || phase === "done") && (
            <div className="flex flex-col gap-1.5 text-sm">
              <StepRow
                label={t.stepScripts}
                state={scriptsDone ? "done" : scriptsFailed ? "warning" : "active"}
              />
              <StepRow
                label={t.stepPanel}
                state={phase === "done" ? "done" : phase === "panel" ? "active" : "pending"}
              />
            </div>
          )}

          {scriptsWarning ? (
            <div className="rounded-md bg-warning-soft text-warning-foreground px-3 py-2 text-xs space-y-1">
              <p>{t.scriptsWarning(scriptsWarning)}</p>
              <p className="opacity-80">
                {t.scriptsWarningHintPrefix}
                <code>bash /root/SetupEnchaAI</code>
                {t.scriptsWarningHintSuffix}
              </p>
            </div>
          ) : null}

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
            </div>
          ) : null}

          {phase === "scripts" || phase === "panel" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {phase === "scripts" ? t.downloadingScripts : t.applyingUpdate}
            </div>
          ) : phase === "done" ? (
            <div className="flex items-center gap-2 text-sm text-success py-2">
              <Check className="h-4 w-4" />
              {t.updatedTo(info.latest ?? "")}
            </div>
          ) : (
            <div className="flex justify-end gap-2 flex-wrap">
              <Button variant="secondary" onClick={() => setPhase("idle")}>
                {t.cancel}
              </Button>
              {scriptsFailed ? (
                <Button variant="secondary" onClick={skipScriptsAndUpdatePanel} disabled={!csrf}>
                  {t.updatePanelOnly}
                </Button>
              ) : null}
              <Button onClick={runUpdate} disabled={!csrf}>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                {scriptsFailed ? t.tryAgain : t.updateNow}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StepRow({
  label,
  state,
}: {
  label: string;
  state: "pending" | "active" | "done" | "warning";
}) {
  return (
    <div className="flex items-center gap-2">
      {state === "done" ? (
        <CircleCheck className="h-4 w-4 text-success shrink-0" />
      ) : state === "warning" ? (
        <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
      ) : state === "active" ? (
        <Loader2 className="h-4 w-4 animate-spin text-coral-600 shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-muted-foreground/40 shrink-0" />
      )}
      <span className={state === "pending" ? "text-muted-foreground" : ""}>{label}</span>
    </div>
  );
}
