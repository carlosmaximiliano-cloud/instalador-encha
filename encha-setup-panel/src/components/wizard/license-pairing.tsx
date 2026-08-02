"use client";
import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MessageCircleWarning, RefreshCw } from "lucide-react";

// Pareamento self-service de licença — o cliente gera a própria licença
// EnchaT de dentro do wizard, sem precisar de uma chave criada por um admin
// à mão no Console. Espelha o protocolo que web/src/components/
// AtivacaoScreen.tsx (repo ENCHAT) e ENCHAT GRÁTIS/instalador/painel.py já
// implementam — mesmos nomes de estado, mesma sequência de chamadas — só
// que ANTES do primeiro boot do app, contra as rotas /api/license/pair/*
// deste painel (nunca fala direto com o Console: ver license-pairing.ts).
//
// Fica dentro do grupo "Licença" do wizard, ao lado do campo `chave_licenca`
// manual (StackField comum, renderizado pelo install-wizard.tsx) — os dois
// convivem: este componente é o caminho principal, o campo de texto é o
// fallback pra quem já tem uma chave.

type PairingSpecUI = { targetField: string; sessionField: string; group?: string };

type Etapa =
  | { kind: "iniciando" }
  | {
      kind: "aguardando";
      pairingId: string;
      codigo: string;
      codigoExibicao?: string;
      numeroExibicao?: string;
      waLink?: string;
      waQrSvg?: string;
      expiraEm?: number;
      signupUrl?: string;
      aviso?: string;
    }
  | { kind: "aguardando_cpf"; pairingId: string; remetenteMascarado?: string }
  | { kind: "escolha"; pairingId: string; licencas: LicencaOfertada[]; escolhaExpiraEm?: number }
  | { kind: "confirmado"; cliente?: string; plano?: string }
  | { kind: "recusado"; motivo?: string }
  | { kind: "expirado" }
  | { kind: "erro"; mensagem: string }
  | { kind: "manual" }; // usuário escolheu colar uma chave existente — não pareia

type LicencaOfertada = { id: number; apelido?: string; plano?: string; vitalicia?: boolean; jaAtivadaAqui?: boolean };

const POLL_INTERVALO_MS = 3000;

// Mesma taxonomia de mensagens de AtivacaoScreen.tsx (repo ENCHAT,
// mensagemDeErro) — copiada de propósito, não importada (não há codegen
// compartilhado entre os dois repos). Se um motivo novo aparecer lá,
// replicar aqui também.
function mensagemRecusa(motivo?: string): string {
  switch (motivo) {
    case "cpf_sem_licenca":
    case "sem_licenca":
    case "sem_licenca_disponivel":
    case "licenca_nao_encontrada":
      return "Não encontramos uma licença disponível para esta ativação.";
    case "ja_ativada_em_outra_vps":
      return "Esta licença já está ativada em outra VPS.";
    case "licenca_revogada":
      return "Esta licença foi cancelada — fale com o suporte para liberar um novo cadastro.";
    case "ja_tem_conta_gratis":
      return "Este CPF já tem uma conta grátis — ative pelo portal ou contate o suporte.";
    case "cpf_ja_cadastrado":
      return "Este CPF já tem cadastro — entre pelo portal em vez de criar uma conta nova.";
    case "celular_ja_cadastrado":
      return "Este celular já está em uso por outra conta.";
    case "excesso_tentativas_cpf":
      return "Muitas tentativas de CPF nesta sessão — gere um novo código.";
    default:
      return motivo ? "Não foi possível concluir agora — contate o suporte EnchaT." : "Não foi possível concluir o pareamento.";
  }
}

// Motivos em que "Gerar outro código" reabriria uma sessão que vai recusar
// do mesmo jeito — mostrar o botão nesses casos é um beco sem saída sem
// explicação de por que não adianta.
const MOTIVOS_SEM_RETRY_UTIL = new Set(["ja_ativada_em_outra_vps", "licenca_revogada"]);

function formatarCpf(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function qrSrc(svg: string): string {
  if (svg.startsWith("data:")) return svg;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function Countdown({ expiraEm }: { expiraEm?: number }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!expiraEm) return null;
  const restanteS = Math.max(0, Math.floor(expiraEm - agora / 1000));
  const m = Math.floor(restanteS / 60);
  const s = restanteS % 60;
  return (
    <span className="text-xs text-muted-foreground tabular-nums">
      expira em {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

export function LicensePairing({
  stackId,
  csrfToken,
  spec,
  form,
}: {
  stackId: string;
  csrfToken: string;
  spec: PairingSpecUI;
  form: UseFormReturn<Record<string, unknown>>;
}) {
  const [etapa, setEtapa] = useState<Etapa>({ kind: "iniciando" });
  const [cpf, setCpf] = useState("");
  const [erroCpf, setErroCpf] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Campo escondido no form pai — RHF só inclui no submit o que está
  // registrado. Vazio até o pareamento confirmar.
  form.register(spec.sessionField);

  function pararPoll() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  async function chamar(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch(`/api/license/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
      body: JSON.stringify({ stackId, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error((data as { error?: string }).error ?? `HTTP ${res.status}`) as Error & { data?: unknown };
      err.data = data;
      throw err;
    }
    return data;
  }

  async function iniciar() {
    setEtapa({ kind: "iniciando" });
    try {
      const d = await chamar("pair/start", {});
      if (d.status === "confirmado") {
        // Retomada de um pareamento já confirmado antes (modal fechado e
        // reaberto depois da confirmação, mas antes do install consumir).
        form.setValue(spec.sessionField, d.pairingId);
        setEtapa({ kind: "confirmado" });
        iniciarPoll(d.pairingId as string); // não deveria mais mudar, mas garante consistência se o install ainda não consumiu
        return;
      }
      setEtapa({
        kind: "aguardando",
        pairingId: d.pairingId as string,
        codigo: (d.codigo as string) ?? (d.codigoExibicao as string) ?? "",
        codigoExibicao: d.codigoExibicao as string | undefined,
        numeroExibicao: d.numeroExibicao as string | undefined,
        waLink: d.waLink as string | undefined,
        waQrSvg: d.waQrSvg as string | undefined,
        expiraEm: d.expiraEm as number | undefined,
        signupUrl: d.signupUrl as string | undefined,
      });
      iniciarPoll(d.pairingId as string);
    } catch (e) {
      const data = (e as { data?: { legacy?: boolean } }).data;
      if (data?.legacy) {
        // Instalação anterior a este mecanismo — pareamento mudaria o
        // fingerprint de uma licença possivelmente já ativa. Cai pro
        // fallback manual sem alarde de erro.
        setEtapa({ kind: "manual" });
        return;
      }
      setEtapa({ kind: "erro", mensagem: e instanceof Error ? e.message : "Não foi possível iniciar o pareamento." });
    }
  }

  function iniciarPoll(pairingId: string) {
    pararPoll();
    pollTimer.current = setInterval(() => poll(pairingId), POLL_INTERVALO_MS);
  }

  async function poll(pairingId: string) {
    try {
      const d = await chamar("pair/poll", { pairingId });
      switch (d.status) {
        case "confirmado":
          pararPoll();
          form.setValue(spec.sessionField, pairingId);
          setEtapa({ kind: "confirmado", cliente: d.cliente as string | undefined, plano: d.plano as string | undefined });
          return;
        case "aguardando_cpf":
          setEtapa({ kind: "aguardando_cpf", pairingId, remetenteMascarado: d.remetenteMascarado as string | undefined });
          return;
        case "escolha_pendente":
          setEtapa({
            kind: "escolha",
            pairingId,
            licencas: (d.licencas as LicencaOfertada[]) ?? [],
            escolhaExpiraEm: d.escolhaExpiraEm as number | undefined,
          });
          return;
        case "recusado":
          pararPoll();
          setEtapa({ kind: "recusado", motivo: d.motivo as string | undefined });
          return;
        case "expirado":
          pararPoll();
          setEtapa({ kind: "expirado" });
          return;
        case "consumido":
          // Já foi usado por um install anterior desta mesma sessão de
          // pareamento — não deveria acontecer no meio de um wizard aberto,
          // mas se acontecer só para de perguntar, sem alarmar.
          pararPoll();
          return;
        default:
          // "aguardando" — continua polling; mantém a etapa atual (não
          // reseta o card pra não piscar a cada 3s).
          setEtapa((prev) => (prev.kind === "aguardando" ? { ...prev, aviso: d.aviso as string | undefined } : prev));
      }
    } catch {
      // Erro de transporte no poll não derruba a sessão — tenta de novo no
      // próximo tick, igual ao app Go faz.
    }
  }

  async function confirmarCpf() {
    if (etapa.kind !== "aguardando_cpf") return;
    const digitos = cpf.replace(/\D/g, "");
    if (digitos.length !== 11) {
      setErroCpf("Informe o CPF do titular da conta (11 dígitos).");
      return;
    }
    setErroCpf(null);
    try {
      await chamar("pair/cpf", { pairingId: etapa.pairingId, cpf: digitos });
      // sucesso: o PRÓXIMO poll é quem resolve (confirmado/recusado) — este
      // endpoint só aciona a etapa, mesmo padrão do app Go.
    } catch (e) {
      setErroCpf(e instanceof Error ? e.message : "Não foi possível confirmar com este CPF — confira os dados e tente de novo.");
    }
  }

  async function escolher(licenseId: number) {
    if (etapa.kind !== "escolha") return;
    try {
      await chamar("pair/choose", { pairingId: etapa.pairingId, licenseId });
    } catch {
      // poll seguinte revela o resultado
    }
  }

  useEffect(() => {
    iniciar();
    return () => pararPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (etapa.kind === "manual") return null; // campo chave_licenca comum já cobre este caso

  if (etapa.kind === "iniciando") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparando pareamento de licença...
      </div>
    );
  }

  if (etapa.kind === "erro") {
    return (
      <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/10 p-3">
        <p className="text-sm text-destructive">{etapa.mensagem}</p>
        <Button type="button" variant="outline" size="sm" onClick={iniciar}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Tentar de novo
        </Button>
        <p className="text-xs text-muted-foreground">
          Ou informe uma chave de licença já existente no campo abaixo.
        </p>
      </div>
    );
  }

  if (etapa.kind === "recusado" || etapa.kind === "expirado") {
    const semRetryUtil = etapa.kind === "recusado" && MOTIVOS_SEM_RETRY_UTIL.has(etapa.motivo ?? "");
    return (
      <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {etapa.kind === "expirado" ? "O tempo para confirmar o pareamento acabou." : mensagemRecusa(etapa.motivo)}
        </p>
        {!semRetryUtil && (
          <Button type="button" variant="outline" size="sm" onClick={iniciar}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Gerar outro código
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Ou informe uma chave de licença já existente no campo abaixo.</p>
      </div>
    );
  }

  if (etapa.kind === "confirmado") {
    return (
      <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
        Licença pareada{etapa.cliente ? ` — ${etapa.cliente}` : ""}{etapa.plano ? ` (${etapa.plano})` : ""}. Pronto para instalar.
      </div>
    );
  }

  if (etapa.kind === "aguardando_cpf") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Recebemos o código{etapa.remetenteMascarado ? ` do número ${etapa.remetenteMascarado}` : ""}. Agora informe o CPF do titular da conta EnchaT para concluir.
        </p>
        <Label htmlFor="pairing-cpf">CPF do titular</Label>
        <Input
          id="pairing-cpf"
          placeholder="000.000.000-00"
          value={formatarCpf(cpf)}
          onChange={(e) => setCpf(e.target.value)}
        />
        {erroCpf && <p className="text-xs text-destructive">{erroCpf}</p>}
        <Button type="button" size="sm" onClick={confirmarCpf}>Continuar</Button>
      </div>
    );
  }

  if (etapa.kind === "escolha") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Encontramos mais de uma licença para este CPF — escolha qual ativar:</p>
          <Countdown expiraEm={etapa.escolhaExpiraEm} />
        </div>
        <div className="space-y-1.5">
          {etapa.licencas.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => escolher(l.id)}
              className="w-full text-left rounded-md border border-input p-2.5 hover:bg-accent transition-colors"
            >
              <div className="font-medium text-sm">{l.apelido ?? `Licença #${l.id}`}</div>
              <div className="text-xs text-muted-foreground">
                {l.plano}
                {l.vitalicia ? " · vitalícia" : ""}
                {l.jaAtivadaAqui ? " · já ativada nesta VPS" : ""}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // aguardando
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm">
            Mande <span className="font-mono font-semibold">{etapa.codigoExibicao ?? etapa.codigo}</span> pelo WhatsApp
            {etapa.numeroExibicao ? ` para ${etapa.numeroExibicao}` : ""}.
          </p>
          {etapa.aviso && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1">
              <MessageCircleWarning className="h-3.5 w-3.5" />
              {etapa.aviso}
            </p>
          )}
        </div>
        <Countdown expiraEm={etapa.expiraEm} />
      </div>
      {etapa.waLink && (
        <a href={etapa.waLink} target="_blank" rel="noopener noreferrer">
          <Button type="button" size="sm" className="w-full">Abrir WhatsApp</Button>
        </a>
      )}
      {etapa.waQrSvg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrSrc(etapa.waQrSvg)} alt="QR code para abrir o WhatsApp" className="mx-auto h-40 w-40" />
      )}
      <div className="flex items-center justify-between text-xs">
        {etapa.signupUrl && (
          <a href={etapa.signupUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Ainda não tenho conta
          </a>
        )}
        <button type="button" onClick={iniciar} className="text-muted-foreground hover:text-foreground ml-auto">
          Gerar outro código
        </button>
      </div>
    </div>
  );
}
