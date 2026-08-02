"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, Loader2, MessageCircleWarning, Paperclip } from "lucide-react";

// Painel de suporte embutido no wizard — abre um ticket ANTES de existir
// licença (chave nunca é enviada, injetada nem pedida aqui: ver header de
// suporte/abrir/route.ts). Fica DENTRO do Dialog que install-wizard.tsx já
// abre (não um Dialog aninhado — dois focus traps e dois overlays por cima
// um do outro), mesmo raciocínio de license-pairing.tsx.
//
// Deliberadamente UM TIRO: abre + anexa, sem ler a thread de volta nem
// permitir responder — é o que cabe no contexto de um wizard de instalação
// (usuário frustrado, foco em resolver o problema, não em manter uma
// conversa). A resposta do admin chega por e-mail/celular informados, ou
// pelo botão de suporte de dentro do próprio EnchaT depois que a instalação
// for concluída (SuporteModal.tsx, repo ENCHAT — esse sim é a thread
// completa).
//
// Limites do anexo espelham o Console (tickets-storage.ts) e o proxy Go
// (internal/http/suporte_handlers.go): imagem 10MB, vídeo 50MB.
const MAX_IMAGEM_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function tamanhoOk(file: File): string | null {
  if (file.type.startsWith("image/")) {
    return file.size > MAX_IMAGEM_BYTES ? "Imagens têm limite de 10MB." : null;
  }
  if (file.type.startsWith("video/")) {
    return file.size > MAX_VIDEO_BYTES ? "Vídeos têm limite de 50MB." : null;
  }
  return "Só é possível anexar imagem ou vídeo.";
}

type Etapa =
  | { kind: "formulario" }
  | { kind: "enviando" }
  | { kind: "aberto"; ticketId: number }
  | { kind: "erro"; mensagem: string };

export function SuportePanel({
  stackId,
  csrfToken,
  contextoErro,
  onVoltar,
}: {
  stackId: string;
  csrfToken: string;
  /** Vazio quando aberto pelo link do rodapé do formulário (sem erro ainda). */
  contextoErro?: string;
  onVoltar: () => void;
}) {
  const [etapa, setEtapa] = useState<Etapa>({ kind: "formulario" });
  const [assunto, setAssunto] = useState(contextoErro ? "Erro na instalação" : "");
  const [mensagem, setMensagem] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [anexando, setAnexando] = useState(false);
  const [anexado, setAnexado] = useState(false);
  const [erroAnexo, setErroAnexo] = useState<string | null>(null);

  function selecionarArquivo(f: File | null) {
    setErroArquivo(null);
    setArquivo(null);
    if (!f) return;
    const problema = tamanhoOk(f);
    if (problema) {
      setErroArquivo(problema);
      return;
    }
    setArquivo(f);
  }

  async function enviar() {
    if (!assunto.trim() || !mensagem.trim()) {
      setEtapa({ kind: "erro", mensagem: "Preencha o assunto e a mensagem." });
      return;
    }
    setEtapa({ kind: "enviando" });
    try {
      const res = await fetch("/api/suporte/abrir", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ scope: stackId, assunto: assunto.trim(), mensagem: mensagem.trim(), contextoErro }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEtapa({ kind: "erro", mensagem: data.error ?? "Não foi possível abrir o chamado agora." });
        return;
      }
      setEtapa({ kind: "aberto", ticketId: data.ticketId });
    } catch (e) {
      setEtapa({ kind: "erro", mensagem: e instanceof Error ? e.message : "Erro de rede." });
    }
  }

  async function anexar(ticketId: number) {
    if (!arquivo) return;
    setAnexando(true);
    setErroAnexo(null);
    try {
      const form = new FormData();
      form.append("scope", stackId);
      form.append("ticketId", String(ticketId));
      form.append("file", arquivo, arquivo.name);
      const res = await fetch("/api/suporte/anexos", {
        method: "POST",
        headers: { "x-csrf-token": csrfToken },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErroAnexo(data.error ?? "Não foi possível anexar o arquivo.");
        return;
      }
      setAnexado(true);
      setArquivo(null);
    } catch (e) {
      setErroAnexo(e instanceof Error ? e.message : "Erro de rede.");
    } finally {
      setAnexando(false);
    }
  }

  if (etapa.kind === "formulario" || etapa.kind === "enviando") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={onVoltar}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <MessageCircleWarning className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Falar com o suporte</h3>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="suporte-assunto">Assunto</Label>
          <Input id="suporte-assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} maxLength={160} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="suporte-mensagem">Mensagem</Label>
          <Textarea
            id="suporte-mensagem"
            rows={5}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            maxLength={8000}
            placeholder="Descreva o que aconteceu..."
          />
        </div>
        <Button type="button" onClick={enviar} disabled={etapa.kind === "enviando"}>
          {etapa.kind === "enviando" && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Enviar
        </Button>
      </div>
    );
  }

  if (etapa.kind === "erro") {
    return (
      <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/10 p-3">
        <p className="text-sm text-destructive">{etapa.mensagem}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setEtapa({ kind: "formulario" })}>
          Tentar de novo
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onVoltar}>
          Voltar
        </Button>
      </div>
    );
  }

  // aberto
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        <p className="text-sm">
          Chamado #{etapa.ticketId} aberto — nossa equipe vai analisar e entrar em contato.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="suporte-anexo" className="flex items-center gap-1">
          <Paperclip className="h-3.5 w-3.5" /> Anexar imagem ou vídeo (opcional)
        </Label>
        <input
          id="suporte-anexo"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => selecionarArquivo(e.target.files?.[0] ?? null)}
          className="text-sm"
          disabled={anexando || anexado}
        />
        {erroArquivo && <p className="text-xs text-destructive">{erroArquivo}</p>}
        {erroAnexo && <p className="text-xs text-destructive">{erroAnexo}</p>}
        {anexado && <p className="text-xs text-emerald-500">Anexo enviado.</p>}
        {arquivo && !anexado && (
          <Button type="button" size="sm" variant="outline" onClick={() => anexar(etapa.ticketId)} disabled={anexando}>
            {anexando && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Enviar anexo
          </Button>
        )}
      </div>

      <Button type="button" onClick={onVoltar}>
        Fechar
      </Button>
    </div>
  );
}
