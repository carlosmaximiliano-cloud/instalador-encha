"use client";
import { useEffect, useState } from "react";
import { Pin, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n/use-dict";
import { fixarVersoesText } from "./fixar-versoes-button.i18n";

type Previa = {
  edicao: "full" | "free";
  versao: string;
  mudancas: { servico: string; de: string; para: string }[];
  varsAdmin: string[];
  nadaAFazer: boolean;
  protegida: boolean;
  versaoSidecar: string;
};
type SidecarInfo = { ok: boolean; motivo?: string; tipo?: "edicao" | "versao" | "ocupado" } | null;
type SyncInfo = { ultimoResultado: string | null; detalhe: string | null; em: number | null; autoDesligada: string | null };

// Ação explícita, só na stack enchat: grava no compose guardado no Portainer
// as imagens que estão rodando. Mostra a prévia e só aplica com confirmação.
export function FixarVersoesButton({ stackId }: { stackId: string }) {
  const t = useDict(fixarVersoesText);
  const [aberto, setAberto] = useState(false);
  const [csrf, setCsrf] = useState("");
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [sync, setSync] = useState<SyncInfo | null>(null);
  const [sidecar, setSidecar] = useState<SidecarInfo>(null);
  const [erro, setErro] = useState("");
  const [aplicando, setAplicando] = useState(false);
  const [resultado, setResultado] = useState<"" | "ok" | "nada">("");

  useEffect(() => {
    if (!aberto) return;
    setPrevia(null);
    setErro("");
    setResultado("");
    let cancelado = false;
    fetch("/api/csrf")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.token && !cancelado && setCsrf(d.token))
      .catch(() => {});
    fetch(`/api/stacks/${stackId}/fixar-versoes`)
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (cancelado) return;
        if (!r.ok) setErro(j?.message ?? t.genericError);
        else {
          setPrevia(j.previa);
          setSync(j.sync ?? null);
          setSidecar(j.sidecar ?? null);
        }
      })
      .catch(() => !cancelado && setErro(t.networkError));
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, stackId]);

  async function aplicar() {
    if (!csrf || aplicando) return;
    setAplicando(true);
    setErro("");
    try {
      const r = await fetch(`/api/stacks/${stackId}/fixar-versoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ confirmar: true }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setErro(j?.message ?? t.genericError);
        return;
      }
      setResultado(j?.resultado?.aplicada ? "ok" : "nada");
    } catch {
      setErro(t.networkError);
    } finally {
      setAplicando(false);
    }
  }

  return (
    <>
      <Button className="w-full" variant="secondary" onClick={() => setAberto(true)}>
        <Pin className="h-4 w-4 mr-2" />
        {t.btn}
      </Button>
      <Dialog open={aberto} onOpenChange={(o) => !aplicando && setAberto(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.title}</DialogTitle>
            <DialogDescription>{t.intro}</DialogDescription>
          </DialogHeader>

          {!previa && !erro && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.loading}
            </div>
          )}

          {previa && !resultado && (
            <div className="space-y-3 text-sm">
              <div>{t.edicao(previa.edicao)}</div>
              <div>{t.versao(previa.versao)}</div>
              {previa.nadaAFazer ? (
                <div className="rounded-md bg-success-soft px-3 py-2">{t.nothing}</div>
              ) : (
                <>
                  {previa.mudancas.length > 0 && (
                    <div>
                      <div className="font-medium mb-1">{t.changes}</div>
                      <ul className="space-y-1 text-xs break-all">
                        {previa.mudancas.map((m) => (
                          <li key={m.servico}>
                            <span className="opacity-70">{m.servico}:</span> {m.de} → <span className="font-medium">{m.para}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {previa.varsAdmin.length > 0 && <div className="text-xs">{t.addsAdmin}</div>}
                  <div className="text-xs opacity-80">{t.mayRestart}</div>
                </>
              )}
              {sidecar && !sidecar.ok ? (
                <div className="rounded-md bg-destructive-soft text-destructive px-3 py-2 text-xs">
                  {sidecar.tipo === "edicao" ? t.sidecarEdicao : sidecar.tipo === "ocupado" ? t.sidecarOcupado : t.sidecarVersao}
                </div>
              ) : null}
              {sync?.autoDesligada ? (
                <div className="text-xs opacity-80">{t.syncAutoOff(sync.autoDesligada)}</div>
              ) : sync?.ultimoResultado && sync.em ? (
                <div className="text-xs opacity-80">{t.syncLast(sync.ultimoResultado, new Date(sync.em).toLocaleString())}</div>
              ) : null}
              <div
                className={
                  previa.protegida
                    ? "rounded-md bg-success-soft px-3 py-2 text-xs"
                    : "rounded-md bg-warning-soft text-warning-foreground px-3 py-2 text-xs"
                }
              >
                {previa.protegida ? t.protectedOk : t.notProtected(previa.versaoSidecar)}
              </div>
            </div>
          )}

          {resultado && (
            <div className="space-y-2 text-sm">
              <div className="rounded-md bg-success-soft px-3 py-2">{resultado === "ok" ? t.done : t.doneNothing}</div>
            </div>
          )}

          {erro && <div className="rounded-md bg-destructive-soft text-destructive px-3 py-2 text-sm">{erro}</div>}

          <div className="flex justify-end gap-2">
            {resultado || erro || previa?.nadaAFazer ? (
              <Button variant="secondary" onClick={() => setAberto(false)}>
                {t.close}
              </Button>
            ) : (
              <>
                <Button variant="secondary" disabled={aplicando} onClick={() => setAberto(false)}>
                  {t.cancel}
                </Button>
                <Button variant="primary" disabled={!previa || !csrf || aplicando || Boolean(sidecar && !sidecar.ok)} onClick={aplicar}>
                  {aplicando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t.applying}
                    </>
                  ) : (
                    t.confirm
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
