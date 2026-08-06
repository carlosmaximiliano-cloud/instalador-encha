"use client";
import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, MessageCircleWarning, RefreshCw, ArrowRightLeft } from "lucide-react";

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
  // Fase 2: 2 tentativas de CPF erradas destravam com email+senha do Super
  // Admin do app, em vez de queimar a sessão (ver informarCPF no Console).
  | { kind: "aguardando_credencial"; pairingId: string }
  | { kind: "escolha"; pairingId: string; licencas: LicencaOfertada[]; escolhaExpiraEm?: number }
  | { kind: "confirmado"; cliente?: string; plano?: string }
  | { kind: "recusado"; pairingId: string; motivo?: string; instalacaoAtual?: InstalacaoAtual }
  | { kind: "migrando"; pairingId: string }
  // Terceiro fator antes do rebind de verdade — abre depois que o usuário
  // confirma o aviso do Dialog ("instalação anterior está ativa há X").
  | { kind: "confirmar_migracao"; pairingId: string; instalacaoAtual?: InstalacaoAtual }
  // Fase 2.2: "celular novo, CPF que já tem cadastro" — troca o telefone
  // cadastrado pelo número já confirmado nesta sessão, via credencial.
  | { kind: "trocando_telefone"; pairingId: string }
  | { kind: "expirado" }
  | { kind: "erro"; mensagem: string }
  | { kind: "manual" }; // usuário escolheu colar uma chave existente — não pareia

type LicencaOfertada = { id: number; apelido?: string; plano?: string; vitalicia?: boolean; jaAtivadaAqui?: boolean };
type InstalacaoAtual = { ultimoCheck?: number; apelido?: string };

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
// explicação de por que não adianta. ja_ativada_em_outra_vps SAIU desta
// lista de propósito: agora tem uma saída própria (migrar a licença pra
// esta instalação), não o retry genérico.
const MOTIVOS_SEM_RETRY_UTIL = new Set(["licenca_revogada"]);

// Descrição legível de há quanto tempo a instalação atual deu sinal —
// alimenta o aviso antes de migrar ("ativa há 2 minutos" vs "sem sinal há
// 6 dias"), pro cliente perceber se está prestes a derrubar algo em uso.
function sinalHaQuanto(ultimoCheckS?: number): string {
  if (!ultimoCheckS) return "nunca fez uma verificação de licença";
  const segundos = Math.max(0, Math.floor(Date.now() / 1000) - ultimoCheckS);
  if (segundos < 120) return "ativa há menos de 2 minutos";
  if (segundos < 3600) return `ativa há ${Math.floor(segundos / 60)} minutos`;
  if (segundos < 86400) return `ativa há ${Math.floor(segundos / 3600)} hora(s)`;
  return `sem sinal há ${Math.floor(segundos / 86400)} dia(s)`;
}

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
  const [credEmail, setCredEmail] = useState("");
  const [credSenha, setCredSenha] = useState("");
  const [erroCredencial, setErroCredencial] = useState<string | null>(null);
  const [enviandoCredencial, setEnviandoCredencial] = useState(false);
  const [confirmandoMigracao, setConfirmandoMigracao] = useState(false);
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
          setEtapa({
            kind: "recusado",
            pairingId,
            motivo: d.motivo as string | undefined,
            instalacaoAtual: d.instalacaoAtual as InstalacaoAtual | undefined,
          });
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
    const pairingId = etapa.pairingId;
    try {
      await chamar("pair/cpf", { pairingId, cpf: digitos });
      // sucesso: o PRÓXIMO poll é quem resolve (confirmado/recusado) — este
      // endpoint só aciona a etapa, mesmo padrão do app Go.
    } catch (e) {
      const data = (e as Error & { data?: { error?: string; tentativas_restantes?: number } }).data;
      if (data?.error === "aguardando_credencial") {
        // 2ª tentativa errada — Fase 2: destrava com email+senha em vez de
        // exigir suporte. Não é um erro de transporte nem de digitação.
        setEtapa({ kind: "aguardando_credencial", pairingId });
        return;
      }
      if (data?.error === "cpf_nao_confere") {
        setErroCpf(
          typeof data.tentativas_restantes === "number"
            ? `CPF não confere — resta ${data.tentativas_restantes} tentativa${data.tentativas_restantes === 1 ? "" : "s"}.`
            : "CPF não confere."
        );
        return;
      }
      setErroCpf(e instanceof Error ? e.message : "Não foi possível confirmar com este CPF — confira os dados e tente de novo.");
    }
  }

  async function confirmarCredencial() {
    if (etapa.kind !== "aguardando_credencial") return;
    if (!credEmail || !credSenha) {
      setErroCredencial("Informe o email e a senha do Super Admin do seu EnchaT.");
      return;
    }
    setErroCredencial(null);
    setEnviandoCredencial(true);
    try {
      await chamar("pair/credencial", { pairingId: etapa.pairingId, email: credEmail, senha: credSenha });
      // sucesso: o poll (que continua rodando em segundo plano) resolve
      // "confirmado" no próximo tick — mesmo padrão de confirmarCpf/escolher.
    } catch (e) {
      setErroCredencial(
        e instanceof Error ? e.message : "Não foi possível entrar com essas credenciais — confira e tente de novo."
      );
    } finally {
      setEnviandoCredencial(false);
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

  async function migrar() {
    if (etapa.kind !== "confirmar_migracao") return;
    if (!credEmail || !credSenha) {
      setErroCredencial("Informe o email e a senha do Super Admin do seu EnchaT.");
      return;
    }
    setErroCredencial(null);
    setEnviandoCredencial(true);
    const pairingId = etapa.pairingId;
    try {
      const d = await chamar("pair/migrar", { pairingId, email: credEmail, senha: credSenha });
      setEtapa({ kind: "migrando", pairingId });
      if (d.sessao_reutilizavel) {
        // Mesma sessão, agora com a licença já vinculada a esta VPS — deixa
        // a etapa "migrando" (spinner) até o próximo poll resolver
        // "confirmado" sozinho; não precisa de estado intermediário novo.
        iniciarPoll(pairingId);
      } else {
        // Sessão anterior foi consumida (caminho de múltiplas licenças) — a
        // licença já foi migrada, mas esta sessão específica não serve
        // mais; abre uma nova, que resolve de primeira (fingerprint já bate).
        iniciar();
      }
    } catch (e) {
      // Fica na MESMA etapa (confirmar_migracao) — credenciais erradas são
      // pra tentar de novo aqui, não pra voltar pro aviso do Dialog.
      setErroCredencial(
        e instanceof Error ? e.message : "Não foi possível migrar a licença — confira as credenciais e tente de novo."
      );
    } finally {
      setEnviandoCredencial(false);
    }
  }

  async function confirmarTrocaTelefone() {
    if (etapa.kind !== "trocando_telefone") return;
    if (!credEmail || !credSenha) {
      setErroCredencial("Informe o email e a senha do Super Admin do seu EnchaT.");
      return;
    }
    setErroCredencial(null);
    setEnviandoCredencial(true);
    const pairingId = etapa.pairingId;
    try {
      await chamar("pair/trocar-telefone", { pairingId, email: credEmail, senha: credSenha });
      // sucesso: mesma sessão, agora com o telefone trocado e a licença já
      // resolvida — o próximo poll confirma sozinho (mesmo padrão de migrar).
      iniciarPoll(pairingId);
    } catch (e) {
      setErroCredencial(
        e instanceof Error ? e.message : "Não foi possível trocar o número — confira as credenciais e tente de novo."
      );
    } finally {
      setEnviandoCredencial(false);
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

  if (etapa.kind === "migrando") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Migrando a licença para esta instalação...
      </div>
    );
  }

  if (etapa.kind === "trocando_telefone") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Confirme com o email e a senha do Super Admin da sua conta EnchaT — isso troca o celular
          cadastrado pelo número que você acabou de confirmar aqui.
        </p>
        <Label htmlFor="pairing-troca-email">Email</Label>
        <Input
          id="pairing-troca-email"
          type="email"
          placeholder="voce@empresa.com"
          value={credEmail}
          onChange={(e) => setCredEmail(e.target.value)}
        />
        <Label htmlFor="pairing-troca-senha">Senha</Label>
        <Input
          id="pairing-troca-senha"
          type="password"
          value={credSenha}
          onChange={(e) => setCredSenha(e.target.value)}
        />
        {erroCredencial && <p className="text-xs text-destructive">{erroCredencial}</p>}
        <Button type="button" size="sm" onClick={confirmarTrocaTelefone} disabled={enviandoCredencial}>
          {enviandoCredencial && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Trocar número
        </Button>
      </div>
    );
  }

  if (etapa.kind === "confirmar_migracao") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Confirme com o email e a senha do Super Admin da sua conta EnchaT — isso move a licença desta
          conta pra ESTA VPS.
        </p>
        {etapa.instalacaoAtual && (
          <p className="text-xs text-muted-foreground">
            Instalação anterior: {sinalHaQuanto(etapa.instalacaoAtual.ultimoCheck)}
            {etapa.instalacaoAtual.apelido ? ` ("${etapa.instalacaoAtual.apelido}")` : ""}.
          </p>
        )}
        <Label htmlFor="pairing-migrar-email">Email</Label>
        <Input
          id="pairing-migrar-email"
          type="email"
          placeholder="voce@empresa.com"
          value={credEmail}
          onChange={(e) => setCredEmail(e.target.value)}
        />
        <Label htmlFor="pairing-migrar-senha">Senha</Label>
        <Input
          id="pairing-migrar-senha"
          type="password"
          value={credSenha}
          onChange={(e) => setCredSenha(e.target.value)}
        />
        {erroCredencial && <p className="text-xs text-destructive">{erroCredencial}</p>}
        <Button type="button" size="sm" onClick={migrar} disabled={enviandoCredencial}>
          {enviandoCredencial && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Migrar licença
        </Button>
      </div>
    );
  }

  if (etapa.kind === "recusado" || etapa.kind === "expirado") {
    const ehOutraVps = etapa.kind === "recusado" && etapa.motivo === "ja_ativada_em_outra_vps";
    const ehCpfJaCadastrado = etapa.kind === "recusado" && etapa.motivo === "cpf_ja_cadastrado";
    const semRetryUtil =
      etapa.kind === "recusado" && MOTIVOS_SEM_RETRY_UTIL.has(etapa.motivo ?? "") && !ehOutraVps && !ehCpfJaCadastrado;
    return (
      <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {etapa.kind === "expirado" ? "O tempo para confirmar o pareamento acabou." : mensagemRecusa(etapa.motivo)}
        </p>
        {ehOutraVps ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setConfirmandoMigracao(true)}>
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
            Esta licença é minha — migrar para esta instalação
          </Button>
        ) : ehCpfJaCadastrado ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEtapa({ kind: "trocando_telefone", pairingId: etapa.pairingId })}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
            Este CPF é meu — trocar meu número
          </Button>
        ) : (
          !semRetryUtil && (
            <Button type="button" variant="outline" size="sm" onClick={iniciar}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Gerar outro código
            </Button>
          )
        )}
        <p className="text-xs text-muted-foreground">Ou informe uma chave de licença já existente no campo abaixo.</p>

        {ehOutraVps && (
          <Dialog open={confirmandoMigracao} onOpenChange={setConfirmandoMigracao}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Migrar esta licença para esta instalação?</DialogTitle>
                <DialogDescription>
                  A instalação anterior está{" "}
                  <strong>{sinalHaQuanto(etapa.instalacaoAtual?.ultimoCheck)}</strong>
                  {etapa.instalacaoAtual?.apelido ? ` ("${etapa.instalacaoAtual.apelido}")` : ""}. Migrar vincula a
                  licença a ESTA VPS — a instalação anterior vai parar de funcionar assim que ela verificar a
                  licença de novo (em até algumas horas).
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setConfirmandoMigracao(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (etapa.kind !== "recusado") return;
                    setConfirmandoMigracao(false);
                    setErroCredencial(null);
                    // Terceiro fator: só o aviso do Dialog não autoriza o
                    // rebind — precisa da senha do dono, próxima tela.
                    setEtapa({ kind: "confirmar_migracao", pairingId: etapa.pairingId, instalacaoAtual: etapa.instalacaoAtual });
                  }}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                  Continuar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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

  if (etapa.kind === "aguardando_credencial") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Não deu pra confirmar pelo CPF. Entre com o email e a senha do Super Admin da sua conta EnchaT pra continuar.
        </p>
        <Label htmlFor="pairing-cred-email">Email</Label>
        <Input
          id="pairing-cred-email"
          type="email"
          placeholder="voce@empresa.com"
          value={credEmail}
          onChange={(e) => setCredEmail(e.target.value)}
        />
        <Label htmlFor="pairing-cred-senha">Senha</Label>
        <Input
          id="pairing-cred-senha"
          type="password"
          value={credSenha}
          onChange={(e) => setCredSenha(e.target.value)}
        />
        {erroCredencial && <p className="text-xs text-destructive">{erroCredencial}</p>}
        <Button type="button" size="sm" onClick={confirmarCredencial} disabled={enviandoCredencial}>
          {enviandoCredencial && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Entrar
        </Button>
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
